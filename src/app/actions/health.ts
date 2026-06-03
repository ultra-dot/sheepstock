"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { getEffectiveUserId } from "@/app/actions/users"

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

    const effectiveUserId = await getEffectiveUserId()

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
        user_id: effectiveUserId
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
            .eq("user_id", effectiveUserId)
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
                .eq("user_id", effectiveUserId)
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
            .eq("user_id", effectiveUserId)

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
            .eq("user_id", effectiveUserId)
    }

    revalidatePath("/health")
    revalidatePath("/inventory")
    revalidatePath("/livestock")
    revalidatePath("/cages")
    revalidatePath("/dashboard")
}

export async function deleteHealthRecord(id: string) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { error: "Unauthorized" }

        const effectiveUserId = await getEffectiveUserId()
        
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
        if (!serviceRoleKey) {
            return { error: "Konfigurasi server tidak lengkap (Service Role Key hilang)" }
        }

        // Gunakan admin client untuk bypass RLS yang tidak memiliki policy DELETE
        const { createClient: createSupabaseClient } = await import('@supabase/supabase-js')
        const adminSupabase = createSupabaseClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            serviceRoleKey
        )

        const { error } = await adminSupabase
            .from("health_records")
            .delete()
            .eq("id", id)
            .eq("user_id", effectiveUserId)

        if (error) {
            return { error: error.message }
        }

        revalidatePath("/health")
        revalidatePath("/dashboard")
        return { success: true }
    } catch (err: any) {
        return { error: err.message || "Unknown error occurred" }
    }
}

export async function updateHealthRecord(id: string, formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    const date = formData.get("date") as string
    const illness_description = formData.get("illness_description") as string
    const treatment = formData.get("treatment") as string
    const status = formData.get("status") as string
    const resolved_at = formData.get("resolved_at") as string || null
    
    const new_item_used_id = formData.get("medicine_id") as string || null
    const new_medicine_qty = parseFloat(formData.get("medicine_qty") as string) || 0
    const quarantine_cage_id = formData.get("quarantine_cage_id") as string || null

    if (!illness_description || !treatment || !status || !date) {
        throw new Error("Field wajib harus diisi")
    }

    // Get old record to find the livestock_id and medicine
    const { data: oldRecord } = await supabase
        .from("health_records")
        .select("livestock_id, status, item_used_id, medicine_qty")
        .eq("id", id)
        .single()

    if (!oldRecord) throw new Error("Rekam medis tidak ditemukan")

    const effectiveUserId = await getEffectiveUserId()

    // Handle medicine stock logic safely
    if (oldRecord.item_used_id !== new_item_used_id || oldRecord.medicine_qty !== new_medicine_qty) {
        let newItemDeductData = null;

        // Check new stock first before doing anything
        if (new_item_used_id && new_medicine_qty > 0) {
            const { data: checkNewItem } = await supabase.from("inventory_items").select("current_stock, name").eq("id", new_item_used_id).single();
            if (!checkNewItem) throw new Error("Obat baru tidak ditemukan");
            
            // If it's the same item, the available stock is current_stock + old_qty
            const availableStock = new_item_used_id === oldRecord.item_used_id 
                ? checkNewItem.current_stock + (oldRecord.medicine_qty || 0) 
                : checkNewItem.current_stock;
                
            if (availableStock < new_medicine_qty) {
                throw new Error(`Stok ${checkNewItem.name} tidak mencukupi. Sisa tersedia: ${availableStock}`);
            }
            newItemDeductData = checkNewItem;
        }

        // Apply changes
        if (oldRecord.item_used_id === new_item_used_id && oldRecord.item_used_id) {
            // Same medicine, just update with new delta
            const diff = new_medicine_qty - (oldRecord.medicine_qty || 0);
            if (diff !== 0 && newItemDeductData) {
                await supabase.from("inventory_items").update({ current_stock: newItemDeductData.current_stock - diff }).eq("id", new_item_used_id);
            }
        } else {
            // Different medicine: refund old, deduct new
            if (oldRecord.item_used_id && (oldRecord.medicine_qty || 0) > 0) {
                const { data: oldItem } = await supabase.from("inventory_items").select("current_stock").eq("id", oldRecord.item_used_id).single();
                if (oldItem) {
                    await supabase.from("inventory_items").update({ current_stock: oldItem.current_stock + oldRecord.medicine_qty }).eq("id", oldRecord.item_used_id);
                }
            }
            if (new_item_used_id && new_medicine_qty > 0 && newItemDeductData) {
                await supabase.from("inventory_items").update({ current_stock: newItemDeductData.current_stock - new_medicine_qty }).eq("id", new_item_used_id);
            }
        }
    }

    // Update health record
    const { error: updateError } = await supabase
        .from("health_records")
        .update({
            date,
            illness_description,
            treatment,
            status,
            item_used_id: new_item_used_id || null,
            medicine_qty: new_medicine_qty || null,
            resolved_at: status === "selesai" ? (resolved_at || new Date().toISOString()) : null,
        })
        .eq("id", id)
        .eq("user_id", effectiveUserId)

    if (updateError) {
        throw new Error(updateError.message)
    }

    // Update livestock status
    const updateData: Record<string, any> = { status: status === "selesai" ? "healthy" : "sick" }
    if (status === "karantina" && quarantine_cage_id) {
        updateData.cage_id = quarantine_cage_id;
    }

    const { data: oldLivestock } = await supabase.from("livestocks").select("cage_id").eq("id", oldRecord.livestock_id).single()

    await supabase
        .from("livestocks")
        .update(updateData)
        .eq("id", oldRecord.livestock_id)
        .eq("user_id", effectiveUserId)

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

    revalidatePath("/health")
    revalidatePath("/inventory")
    revalidatePath("/livestock")
    revalidatePath("/cages")
    revalidatePath("/dashboard")
}
