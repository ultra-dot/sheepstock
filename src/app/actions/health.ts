"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function addHealthRecord(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    const livestock_id = formData.get("livestock_id") as string
    const date = formData.get("date") as string
    const illness_description = formData.get("illness_description") as string
    const treatment = formData.get("treatment") as string
    const item_used_id = formData.get("medicine_id") as string || null
    const medicine_qty = parseFloat(formData.get("medicine_qty") as string) || 0
    const status = formData.get("status") as string || "pemulihan"

    if (!livestock_id || !date || !illness_description || !treatment) {
        throw new Error("Semua field wajib harus diisi")
    }

    // Insert health record
    const { error: insertError } = await supabase.from("health_records").insert({
        livestock_id,
        date,
        illness_description,
        treatment,
        item_used_id: item_used_id || null,
        medicine_qty: medicine_qty || null,
        status,
        recorded_by: user.id,
        user_id: user.id
    })

    if (insertError) {
        throw new Error(insertError.message)
    }

    // Auto-deduct medicine stock if medicine was used
    if (item_used_id && medicine_qty > 0) {
        const { data: item } = await supabase
            .from("inventory_items")
            .select("current_stock, name")
            .eq("id", item_used_id)
            .eq("user_id", user.id)
            .single()

        if (item) {
            const newStock = item.current_stock - medicine_qty
            if (newStock < 0) {
                throw new Error(`Stok ${item.name} tidak mencukupi. Sisa: ${item.current_stock}`)
            }
            await supabase
                .from("inventory_items")
                .update({ current_stock: newStock })
                .eq("id", item_used_id)
                .eq("user_id", user.id)
        }
    }

    // Update livestock status to sick if status is karantina or pemulihan
    if (status === "karantina" || status === "pemulihan") {
        const quarantine_cage_id = formData.get("quarantine_cage_id") as string || null

        const updateData: Record<string, any> = { status: "sick" }
        if (status === "karantina" && quarantine_cage_id) {
            updateData.cage_id = quarantine_cage_id
        }

        // Get old cage_id before update
        const { data: oldLivestock } = await supabase
            .from("livestocks")
            .select("cage_id")
            .eq("id", livestock_id)
            .single()

        await supabase
            .from("livestocks")
            .update(updateData)
            .eq("id", livestock_id)
            .eq("user_id", user.id)

        // Sync cage occupancies if cage changed
        if (status === "karantina" && quarantine_cage_id && oldLivestock && oldLivestock.cage_id !== quarantine_cage_id) {
            const syncCage = async (cageId: string) => {
                const { count } = await supabase.from("livestocks").select("*", { count: 'exact', head: true }).in("status", ["healthy", "sick"]).eq("cage_id", cageId)
                const { data: cageInfo } = await supabase.from("cages").select("capacity, status").eq("id", cageId).single()
                if (cageInfo) {
                    const occ = count || 0
                    let newStatus = cageInfo.status
                    if (newStatus !== "maintenance") {
                        newStatus = occ >= cageInfo.capacity ? 'full' : (occ > 0 ? 'optimal' : 'available')
                    }
                    await supabase.from("cages").update({ current_occupancy: occ, status: newStatus }).eq("id", cageId)
                }
            }
            await syncCage(oldLivestock.cage_id)
            await syncCage(quarantine_cage_id)
        }
    } else if (status === "selesai") {
        await supabase
            .from("livestocks")
            .update({ status: "healthy" })
            .eq("id", livestock_id)
            .eq("user_id", user.id)
    }

    revalidatePath("/health")
    revalidatePath("/inventory")
    revalidatePath("/livestock")
    revalidatePath("/cages")
    revalidatePath("/dashboard")
}

export async function deleteHealthRecord(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    const { error, count } = await supabase
        .from("health_records")
        .delete({ count: 'exact' })
        .eq("id", id)
        .eq("user_id", user.id)

    if (error) {
        throw new Error(error.message)
    }

    if (count === 0) {
        throw new Error("Gagal menghapus: Anda tidak memiliki akses DELETE (cek RLS Policy di Supabase)")
    }

    revalidatePath("/health")
    revalidatePath("/dashboard")
}

export async function updateHealthRecord(id: string, formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    const illness_description = formData.get("illness_description") as string
    const treatment = formData.get("treatment") as string
    const status = formData.get("status") as string
    const resolved_at = formData.get("resolved_at") as string || null

    if (!illness_description || !treatment || !status) {
        throw new Error("Field wajib harus diisi")
    }

    // Get old record to find the livestock_id
    const { data: oldRecord } = await supabase
        .from("health_records")
        .select("livestock_id, status")
        .eq("id", id)
        .single()

    if (!oldRecord) throw new Error("Rekam medis tidak ditemukan")

    // Update health record
    const { error: updateError } = await supabase
        .from("health_records")
        .update({
            illness_description,
            treatment,
            status,
            resolved_at: status === "selesai" ? (resolved_at || new Date().toISOString()) : null,
        })
        .eq("id", id)
        .eq("user_id", user.id)

    if (updateError) {
        throw new Error(updateError.message)
    }

    // Update livestock status
    if (status === "selesai") {
        await supabase
            .from("livestocks")
            .update({ status: "healthy" })
            .eq("id", oldRecord.livestock_id)
            .eq("user_id", user.id)
    } else if (status === "karantina" || status === "pemulihan") {
        await supabase
            .from("livestocks")
            .update({ status: "sick" })
            .eq("id", oldRecord.livestock_id)
            .eq("user_id", user.id)
    }

    revalidatePath("/health")
    revalidatePath("/livestock")
    revalidatePath("/dashboard")
}
