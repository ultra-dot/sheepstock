"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

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
        user_id: user.id
    }).select().single()

    if (insertError) {
        throw new Error(insertError.message)
    }

    // Insert an initial weighing record for analytics
    await supabase.from("weighing_records").insert({
        livestock_id: newLivestock.id,
        weight: initial_weight,
        scanned_by: user.id,
        user_id: user.id
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

    const { error: updateError } = await supabase.from("livestocks").update({
        qr_code,
        type,
        gender,
        age_months,
        current_weight,
        cage_id: new_cage_id,
        status,
    }).eq("id", id)

    if (updateError) {
        throw new Error(updateError.message)
    }

    // Sync health records based on status
    if (status === 'sick') {
        const illness = formData.get("illness_description") as string;
        const treatment = formData.get("treatment") as string;
        const medicine_id = formData.get("medicine_id") as string;
        const medicine_qty = parseFloat(formData.get("medicine_qty") as string);
        const health_status = formData.get("health_status") as string || "karantina";

        // Always create a new health record ticket if illness is provided
        if (illness) {
            const { error: insertErr } = await supabase.from("health_records").insert({
                livestock_id: id,
                date: new Date().toISOString().split('T')[0],
                illness_description: illness,
                treatment,
                item_used_id: medicine_id || null,
                medicine_qty: isNaN(medicine_qty) ? null : medicine_qty,
                status: health_status,
                recorded_by: user.id,
                user_id: user.id
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
        await supabase.from("weighing_records").insert({
            livestock_id: id,
            weight: current_weight,
            scanned_by: user.id,
            user_id: user.id
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
}

export async function deleteLivestock(id: string, cageId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    // Get current record to know which cage it belongs to if cageId isn't passed reliably
    const { data: livestock } = await supabase.from("livestocks").select("cage_id").eq("id", id).single()

    const { error } = await supabase.from("livestocks").delete().eq("id", id).eq("user_id", user.id)

    if (error) {
        throw new Error(error.message)
    }

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
