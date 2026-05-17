"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function processHarvest(formData: FormData) {
    const supabase = await createClient();

    const customerName = formData.get("customer_name") as string;
    const harvestType = formData.get("harvest_type") as string || "potong";
    const livestockDataRaw = formData.get("livestock_data") as string;
    
    if (!livestockDataRaw || !customerName) {
        throw new Error("Data ternak dan Nama Pembeli tidak lengkap.");
    }

    let livestockData: { id: string, price: number, weight: number }[] = [];
    try {
        livestockData = JSON.parse(livestockDataRaw);
    } catch (e) {
        throw new Error("Format data ternak tidak valid.");
    }

    if (livestockData.length === 0) {
        throw new Error("Tidak ada domba yang dipilih untuk diproses.");
    }

    // Carcass weight is only relevant for "potong" (which is currently restricted to single processing anyway)
    const rawCarcassWeight = formData.get("carcass_weight") as string || "";
    const carcassWeight = rawCarcassWeight ? parseFloat(rawCarcassWeight.replace(/,/g, ".")) : null;

    if (harvestType === "potong" && !carcassWeight) {
        throw new Error("Mohon lengkapi Berat Karkas untuk tipe Potong.");
    }

    // Handle Camera or Gallery files for Live Photo (Shared for Bulk)
    const livePhotoCamera = formData.get("live_photo_camera") as File;
    const livePhotoGallery = formData.get("live_photo_gallery") as File;
    const livePhoto = (livePhotoCamera && livePhotoCamera.size > 0) ? livePhotoCamera : livePhotoGallery;

    // Handle Camera or Gallery files for Carcass Photo
    const carcassPhotoCamera = formData.get("carcass_photo_camera") as File;
    const carcassPhotoGallery = formData.get("carcass_photo_gallery") as File;
    const carcassPhoto = (carcassPhotoCamera && carcassPhotoCamera.size > 0) ? carcassPhotoCamera : carcassPhotoGallery;

    let livePhotoUrl = null;
    let carcassPhotoUrl = null;

    // Upload live photo (once for all items in this transaction batch)
    if (livePhoto && livePhoto.size > 0) {
        const fileExt = livePhoto.name.split('.').pop();
        // Use the first livestock ID as the representative name to avoid massive filenames
        const fileName = `live_${livestockData[0].id}_${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
            .from('harvest_photos')
            .upload(fileName, livePhoto);
        
        if (uploadError) throw new Error("Gagal mengunggah foto hidup: " + uploadError.message);
        
        const { data: publicUrlData } = supabase.storage.from('harvest_photos').getPublicUrl(fileName);
        livePhotoUrl = publicUrlData.publicUrl;
    }

    // Upload carcass photo (only if provided and for potong)
    if (harvestType === 'potong' && carcassPhoto && carcassPhoto.size > 0) {
        const fileExt = carcassPhoto.name.split('.').pop();
        const fileName = `carcass_${livestockData[0].id}_${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
            .from('harvest_photos')
            .upload(fileName, carcassPhoto);
        
        if (uploadError) throw new Error("Gagal mengunggah foto karkas: " + uploadError.message);
        
        const { data: publicUrlData } = supabase.storage.from('harvest_photos').getPublicUrl(fileName);
        carcassPhotoUrl = publicUrlData.publicUrl;
    }

    // Fetch all livestock information (to get their cage_ids for occupancy updates)
    const idsToFetch = livestockData.map(l => l.id);
    const { data: livestocks, error: fetchError } = await supabase
        .from('livestocks')
        .select('id, cage_id')
        .in('id', idsToFetch);
    
    if (fetchError || !livestocks || livestocks.length === 0) {
        throw new Error("Gagal memverifikasi ternak dari database.");
    }

    // Process each livestock individually
    for (const data of livestockData) {
        const livestock = livestocks.find(l => l.id === data.id);
        if (!livestock) continue; // Skip if not found

        // 1. Insert HarvestRecord
        const recordPayload: any = {
            livestock_id: data.id,
            live_weight: data.weight, // from frontend calculation (borongan or satuan)
            customer_name: customerName,
            selling_price: data.price, // from frontend calculation (borongan or satuan)
            harvest_date: new Date().toISOString(),
            status: 'completed',
            live_photo_url: livePhotoUrl,
            carcass_photo_url: carcassPhotoUrl,
            harvest_type: harvestType
        };

        if (carcassWeight !== null && harvestType === 'potong') {
            recordPayload.carcass_weight = carcassWeight;
        }

        const { error: insertError } = await supabase
            .from('harvest_records')
            .insert(recordPayload);
        
        if (insertError) {
            console.warn(`[HarvestAction] Attempting fallback insert without harvest_type for ${data.id}:`, insertError.message);
            // Fallback for missing 'harvest_type' column or strict NOT NULL on carcass_weight
            const fallbackPayload = { ...recordPayload };
            delete fallbackPayload.harvest_type;
            if (harvestType === 'jual_hidup') {
                fallbackPayload.carcass_weight = 0; // fallback to 0 if db complains about null
            }
            const { error: fallbackError } = await supabase
                .from('harvest_records')
                .insert(fallbackPayload);
                
            if (fallbackError) throw new Error(`Gagal menyimpan transaksi untuk ternak ${data.id}: ` + fallbackError.message);
        }

        // 2. Update Livestock status
        const { error: updateLvError } = await supabase
            .from('livestocks')
            .update({ status: 'sold' })
            .eq('id', data.id);
        
        if (updateLvError) throw new Error(`Gagal memperbarui status ternak ${data.id}: ` + updateLvError.message);

        // 3. Update Cage occupancy
        if (livestock.cage_id) {
            const { data: cage } = await supabase.from('cages').select('current_occupancy').eq('id', livestock.cage_id).single();
            if (cage && cage.current_occupancy > 0) {
                await supabase.from('cages').update({ current_occupancy: cage.current_occupancy - 1 }).eq('id', livestock.cage_id);
            }
        }
    }

    // Revalidate paths to reflect updates instantly
    revalidatePath('/harvest');
    revalidatePath('/livestock');
    revalidatePath('/cages');
}
