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
}
