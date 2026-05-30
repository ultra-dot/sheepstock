"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { createAuditLog } from "@/lib/audit"
import { getEffectiveUserId } from "@/app/actions/users"

export async function addLivestock(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    const qr_code = formData.get("qr_code") as string
    const type = formData.get("type") as string
    const gender = formData.get("gender") as string
    const age_months = parseInt(formData.get("age_months") as string)
    const initial_weight = parseFloat(formData.get("weight") as string)
    const cage_id = formData.get("cage_id") as string
    const status = formData.get("status") as string || "healthy"

    // Check if QR already exists
    const { data: existing } = await supabase.from("livestocks").select("id").eq("qr_code", qr_code).single()
    if (existing) {
        throw new Error("QR Code atau ID sudah terdaftar!")
    }

    const effectiveUserId = await getEffectiveUserId()

    const { data: newLivestock, error: insertError } = await supabase.from("livestocks").insert({
        qr_code,
        type,
        gender,
        age_months,
        initial_weight,
        current_weight: initial_weight,
        cage_id,
        status,
        entry_date: new Date().toISOString(),
        user_id: effectiveUserId
    }).select().single()

    if (insertError) {
        throw new Error(insertError.message)
    }

    const typeDisplay = type === 'kambing' ? 'kambing' : 'domba';
    await createAuditLog('CREATE', 'livestock', `Menambahkan ${typeDisplay} baru dengan QR: ${qr_code}`, newLivestock.id, null, newLivestock)

    // Insert an initial weighing record for analytics
    await supabase.from("weighing_records").insert({
        livestock_id: newLivestock.id,
        weight: initial_weight,
        scanned_by: user.id,
        user_id: effectiveUserId
    })

    // Synchronize Target Cage Occupancy
    const { count } = await supabase.from("livestocks").select("*", { count: 'exact', head: true }).in("status", ["healthy", "sick"]).eq("cage_id", cage_id);
    const occupancy = count || 0;

    const { data: cageInfo } = await supabase.from("cages").select("capacity, status").eq("id", cage_id).single();
    if (cageInfo) {
        let newStatus = cageInfo.status;
        if (newStatus !== "maintenance") {
            newStatus = occupancy >= cageInfo.capacity ? 'full' : (occupancy > 0 ? 'optimal' : 'available');
        }
        await supabase.from("cages").update({
            current_occupancy: occupancy,
            status: newStatus
        }).eq("id", cage_id);
    }

    revalidatePath("/livestock")
    revalidatePath("/cages")
    revalidatePath("/dashboard")
}

export async function updateLivestock(id: string, formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    const qr_code = formData.get("qr_code") as string
    const type = formData.get("type") as string
    const gender = formData.get("gender") as string
    const age_months = parseInt(formData.get("age_months") as string)
    const current_weight = parseFloat(formData.get("weight") as string)
    const new_cage_id = formData.get("cage_id") as string
    const status = formData.get("status") as string || "healthy"

    // Get old cage_id to check if it changed
    const { data: oldData } = await supabase.from("livestocks").select("cage_id, current_weight").eq("id", id).single()

    // Get old full data
    const { data: oldDataFull } = await supabase.from("livestocks").select("*").eq("id", id).single()

    const { data: updatedData, error: updateError } = await supabase.from("livestocks").update({
        qr_code,
        type,
        gender,
        age_months,
        current_weight,
        cage_id: new_cage_id,
        status,
    }).eq("id", id).select().single()

    if (updateError) {
        throw new Error(updateError.message)
    }

    await createAuditLog('UPDATE', 'livestock', `Memperbarui data ternak dengan QR: ${qr_code}`, id, oldDataFull, updatedData)

    // Sync health records based on status
    if (status === 'sick') {
        const illness = formData.get("illness_description") as string;
        const treatment = formData.get("treatment") as string;
        const medicine_id = formData.get("medicine_id") as string;
        const medicine_qty = parseFloat(formData.get("medicine_qty") as string);
        const health_status = formData.get("health_status") as string || "karantina";

        // Always create a new health record ticket if illness is provided
        if (illness) {
            const effectiveUserId = await getEffectiveUserId()

            const { error: insertErr } = await supabase.from("health_records").insert({
                livestock_id: id,
                date: new Date().toISOString().split('T')[0],
                illness_description: illness,
                treatment,
                item_used_id: medicine_id || null,
                medicine_qty: isNaN(medicine_qty) ? null : medicine_qty,
                status: health_status,
                recorded_by: user.id,
                user_id: effectiveUserId
            });

            if (insertErr) {
                console.error("[Livestock→Health Sync] Insert error:", insertErr.message);
            }

            // Auto-deduct medicine stock if medicine was used
            if (medicine_id && !isNaN(medicine_qty) && medicine_qty > 0) {
                const { data: item } = await supabase
                    .from("inventory_items")
                    .select("current_stock")
                    .eq("id", medicine_id)
                    .single();

                if (item) {
                    const newStock = item.current_stock - medicine_qty;
                    if (newStock >= 0) {
                        await supabase
                            .from("inventory_items")
                            .update({ current_stock: newStock })
                            .eq("id", medicine_id);
                    }
                }
            }
        }
    } else if (status === 'healthy') {
        // Resolve all active health records for this livestock
        await supabase.from("health_records").update({
            status: 'selesai',
            resolved_at: new Date().toISOString()
        })
            .eq("livestock_id", id)
            .in("status", ["karantina", "pemulihan"]);
    }

    // Add weighing record if weight changed
    if (oldData && oldData.current_weight !== current_weight) {
        const effectiveUserId = await getEffectiveUserId()
        await supabase.from("weighing_records").insert({
            livestock_id: id,
            weight: current_weight,
            scanned_by: user.id,
            user_id: effectiveUserId
        })
    }

    // Synchronize cage occupancies if cage changed or status changed
    const updateCageOccupancy = async (cageId: string) => {
        if (!cageId) return;
        const { data: cageInfo } = await supabase.from("cages").select("capacity, status").eq("id", cageId).single();
        if (!cageInfo) return;

        const { count } = await supabase.from("livestocks").select("*", { count: 'exact', head: true }).in("status", ["healthy", "sick"]).eq("cage_id", cageId);
        const occupancy = count || 0;

        let newStatus = cageInfo.status;
        if (newStatus !== "maintenance") {
            newStatus = occupancy >= cageInfo.capacity ? 'full' : (occupancy > 0 ? 'optimal' : 'available');
        }
        await supabase.from("cages").update({
            current_occupancy: occupancy,
            status: newStatus
        }).eq("id", cageId);
    }

    if (oldData && oldData.cage_id !== new_cage_id) {
        await updateCageOccupancy(oldData.cage_id)
    }
    await updateCageOccupancy(new_cage_id)

    revalidatePath("/livestock")
    revalidatePath("/cages")
    revalidatePath("/health")
    revalidatePath("/dashboard")
}

export async function deleteLivestock(id: string, cageId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    const effectiveUserId = await getEffectiveUserId()

    // Get current record to know which cage it belongs to if cageId isn't passed reliably
    const { data: livestock } = await supabase.from("livestocks").select("*").eq("id", id).single()

    const { error } = await supabase.from("livestocks").delete().eq("id", id).eq("user_id", effectiveUserId)

    if (error) {
        if (error.code === '23503' || error.message.includes('foreign key constraint')) {
            throw new Error("Gagal menghapus: Data ternak ini tidak dapat dihapus karena sudah memiliki riwayat panen, penjualan, atau data terkait lainnya.");
        }
        throw new Error(error.message)
    }

    await createAuditLog('DELETE', 'livestock', `Menghapus data ternak dengan QR: ${livestock?.qr_code || 'Tidak diketahui'}`, id, livestock, null)

    // Update cage occupancy
    const targetCageId = livestock?.cage_id || cageId
    if (targetCageId) {
        const { data: cageInfo } = await supabase.from("cages").select("capacity, status").eq("id", targetCageId).single();
        if (cageInfo) {
            const { count } = await supabase.from("livestocks").select("*", { count: 'exact', head: true }).in("status", ["healthy", "sick"]).eq("cage_id", targetCageId);
            const occupancy = count || 0;

            let newStatus = cageInfo.status;
            if (newStatus !== "maintenance") {
                newStatus = occupancy >= cageInfo.capacity ? 'full' : (occupancy > 0 ? 'optimal' : 'available');
            }
            await supabase.from("cages").update({
                current_occupancy: occupancy,
                status: newStatus
            }).eq("id", targetCageId);
        }
    }

    revalidatePath("/livestock")
    revalidatePath("/cages")
    revalidatePath("/dashboard")
}

export async function getLivestockHistory(livestockId: string) {
    const supabase = await createClient()

    // Fetch health records
    const { data: healthRecords } = await supabase
        .from("health_records")
        .select(`
            *,
            inventory_items ( name )
        `)
        .eq("livestock_id", livestockId)
        .order("date", { ascending: false })

    // Fetch weighing records
    const { data: weighingRecords } = await supabase
        .from("weighing_records")
        .select("*")
        .eq("livestock_id", livestockId)
        .order("recorded_at", { ascending: false })

    return {
        healthRecords: healthRecords || [],
        weighingRecords: weighingRecords || []
    }
}

export async function importLivestocksBatch(livestocksData: any[]) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    const effectiveUserId = await getEffectiveUserId()

    // Filter out rows that are entirely empty or don't have QR Code
    const validRows = livestocksData.filter(row => row.qr_code && row.qr_code.trim() !== "");
    if (validRows.length === 0) throw new Error("Tidak ada data valid untuk diimport.");

    // Extract all QR codes to check for duplicates in DB
    const qrCodes = validRows.map(row => row.qr_code.trim());
    
    const { data: existingQrs } = await supabase
        .from("livestocks")
        .select("qr_code")
        .in("qr_code", qrCodes);

    if (existingQrs && existingQrs.length > 0) {
        const dups = existingQrs.map(r => r.qr_code).join(", ");
        throw new Error(`Terdapat QR Code yang sudah ada di sistem: ${dups}`);
    }

    // Build insert array
    const now = new Date().toISOString();
    const insertData = validRows.map(row => {
        const weight = parseFloat(row.weight) || 0;
        return {
            qr_code: row.qr_code.trim(),
            type: row.type || "domba",
            gender: row.gender || "male",
            age_months: parseInt(row.age_months) || 0,
            initial_weight: weight,
            current_weight: weight,
            cage_id: row.cage_id, // assuming UI resolves Cage Name -> Cage ID before sending here
            status: "healthy", // Default for new imported
            entry_date: now,
            user_id: effectiveUserId
        };
    });

    // 1. Insert livestocks
    const { data: insertedLivestocks, error: insertError } = await supabase
        .from("livestocks")
        .insert(insertData)
        .select("id, initial_weight, cage_id");

    if (insertError) throw new Error(`Gagal mengimport: ${insertError.message}`);

    // 2. Insert initial weighing records
    if (insertedLivestocks && insertedLivestocks.length > 0) {
        const weighingData = insertedLivestocks.map(l => ({
            livestock_id: l.id,
            weight: l.initial_weight,
            scanned_by: user.id,
            user_id: effectiveUserId
        }));
        await supabase.from("weighing_records").insert(weighingData);

        // 3. Update Cage Occupancy (group by cage_id)
        const cagesToUpdate = Array.from(new Set(insertedLivestocks.map(l => l.cage_id).filter(Boolean)));
        for (const cid of cagesToUpdate) {
            const cageIdStr = cid as string;
            const { data: cageInfo } = await supabase.from("cages").select("capacity, status").eq("id", cageIdStr).single();
            if (cageInfo) {
                const { count } = await supabase.from("livestocks").select("*", { count: 'exact', head: true }).in("status", ["healthy", "sick"]).eq("cage_id", cageIdStr);
                const occupancy = count || 0;
                let newStatus = cageInfo.status;
                if (newStatus !== "maintenance") {
                    newStatus = occupancy >= cageInfo.capacity ? 'full' : (occupancy > 0 ? 'optimal' : 'available');
                }
                await supabase.from("cages").update({
                    current_occupancy: occupancy,
                    status: newStatus
                }).eq("id", cageIdStr);
            }
        }

        // 4. Audit Log
        await createAuditLog('CREATE', 'livestock', `Import massal ${insertedLivestocks.length} ekor ternak`, undefined, null, null);
    }

    revalidatePath("/livestock")
    revalidatePath("/cages")
    revalidatePath("/dashboard")
}

export async function weighLivestock(id: string, weight: number) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    const effectiveUserId = await getEffectiveUserId()

    const { data: oldData } = await supabase.from("livestocks").select("current_weight").eq("id", id).single()
    if (!oldData) throw new Error("Ternak tidak ditemukan")

    if (oldData.current_weight === weight) {
        throw new Error("Berat ternak masih sama, tidak ada perubahan.")
    }

    // Update livestock
    const { error: updateError } = await supabase.from("livestocks").update({
        current_weight: weight,
        updated_at: new Date().toISOString()
    }).eq("id", id)

    if (updateError) {
        throw new Error(updateError.message)
    }

    // Insert weighing record
    await supabase.from("weighing_records").insert({
        livestock_id: id,
        weight: weight,
        scanned_by: user.id,
        user_id: effectiveUserId
    })

    await createAuditLog('UPDATE', 'weighing_records', `Pembaruan berat ternak (ID: ${id}) menjadi ${weight} Kg via Fast Scan`, undefined, null, null)

    revalidatePath("/livestock")
    revalidatePath("/cages")
    revalidatePath("/dashboard")
}
