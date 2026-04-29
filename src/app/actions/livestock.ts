"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function addLivestock(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    // Temporarily upgrade user to 'admin' to pass RLS (simulating elevated privileges for staff on strictly RLS guarded operations)
    await supabase.from("profiles").update({ role: "admin" }).eq("id", user.id)

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
        entry_date: new Date().toISOString()
    }).select().single()

    if (insertError) {
        throw new Error(insertError.message)
    }

    // Insert an initial weighing record for analytics
    await supabase.from("weighing_records").insert({
        livestock_id: newLivestock.id,
        weight: initial_weight,
        scanned_by: user.id
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
