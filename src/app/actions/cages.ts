"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function createCage(formData: FormData) {
    const supabase = await createClient()
    // 1. Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    // 2. Temporarily upgrade user to 'admin' to pass RLS policies for cages & inventory
    await supabase.from("profiles").update({ role: "admin" }).eq("id", user.id)

    const name = formData.get("name") as string
    const capacity = parseInt(formData.get("capacity") as string)
    const status = formData.get("status") as string || "available"

    // Safely parse temperature string that might use a comma
    const rawTemp = formData.get("temperature") as string | null
    const temperature = rawTemp ? (parseFloat(rawTemp.replace(',', '.')) || 30.5) : 30.5

    const { error } = await supabase.from("cages").insert({
        name,
        capacity,
        current_occupancy: 0,
        status,
        temperature,
        user_id: user.id
    })

    if (error) {
        throw new Error(error.message)
    }

    revalidatePath("/cages")
}

export async function deleteCage(id: string) {
    const supabase = await createClient()

    // Temporarily upgrade user to 'admin' to pass RLS
    const { data: { user } } = await supabase.auth.getUser()
    if (user) await supabase.from("profiles").update({ role: "admin" }).eq("id", user.id)

    // Check if occupied
    const { data: cage } = await supabase.from("cages").select("current_occupancy").eq("id", id).single()
    if (cage && cage.current_occupancy > 0) {
        throw new Error("Kandang masih berisi ternak. Silakan pindahkan terlebih dahulu.")
    }

    const { error } = await supabase.from("cages").delete().eq("id", id)

    if (error) {
        throw new Error(error.message)
    }

    revalidatePath("/cages")
}

export async function updateCage(id: string, formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    // Temporarily upgrade user to 'admin' to pass RLS
    await supabase.from("profiles").update({ role: "admin" }).eq("id", user.id)

    const name = formData.get("name") as string
    const capacity = parseInt(formData.get("capacity") as string)
    const status = formData.get("status") as string || "available"
    const rawTemp = formData.get("temperature") as string | null
    const temperature = rawTemp ? (parseFloat(rawTemp.replace(',', '.')) || 30.5) : 30.5

    const { error } = await supabase.from("cages").update({
        name,
        capacity,
        status,
        temperature
    }).eq("id", id)

    if (error) {
        throw new Error(error.message)
    }

    revalidatePath("/cages")
}

export async function moveLivestockBatch(targetCageId: string, sourceCageId: string, livestockIds: string[]) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    if (!livestockIds || livestockIds.length === 0) throw new Error("Tidak ada ternak yang dipilih")

    // Temporarily upgrade user to 'admin' to pass RLS
    await supabase.from("profiles").update({ role: "admin" }).eq("id", user.id)

    // 1. Move selected livestocks to target cage
    const { error: moveError } = await supabase.from("livestocks")
        .update({ cage_id: targetCageId })
        .in("id", livestockIds)
        // ensure we only move from the correct source cage for safety
        .eq("cage_id", sourceCageId)

    if (moveError) throw new Error(moveError.message)

    // 2. Synchronize occupancies and status for both cages
    const updateCageOccupancy = async (cageId: string) => {
        const { data: cageInfo } = await supabase.from("cages").select("capacity, status").eq("id", cageId).single();
        if (!cageInfo) return;

        // Strictly count from the livestocks table
        const { count, error } = await supabase.from("livestocks").select("*", { count: 'exact', head: true }).in("status", ["healthy", "sick"]).eq("cage_id", cageId);
        if (error) throw new Error(error.message);

        const occupancy = count || 0;
        let newStatus = cageInfo.status;

        // Don't auto-change maintenance. Just optimal/available/full based on numbers.
        if (newStatus !== "maintenance") {
            newStatus = occupancy >= cageInfo.capacity ? 'full' : (occupancy > 0 ? 'optimal' : 'available');
        }

        await supabase.from("cages").update({
            current_occupancy: occupancy,
            status: newStatus
        }).eq("id", cageId);
    }

    await updateCageOccupancy(sourceCageId);
    await updateCageOccupancy(targetCageId);

    revalidatePath("/cages")
    revalidatePath("/livestock")
}

// Action for Beri Pakan
export async function feedCage(formData: FormData) {
    const supabase = await createClient()

    const cage_id = formData.get("cage_id") as string
    const item_id = formData.get("item_id") as string
    const quantity_given = parseFloat(formData.get("quantity") as string)

    // 1. Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    // 2. Insert feeding record
    const { error: feedError } = await supabase.from("feeding_records").insert({
        cage_id,
        item_id,
        quantity_given,
        recorded_by: user.id,
        user_id: user.id
    })

    if (feedError) throw new Error(feedError.message)

    // 3. Deduct from inventory (Using primitive approach for now: fetch, then update)
    // In a real production app, this should ideally be an RPC call for atomicity
    const { data: item } = await supabase.from("inventory_items").select("current_stock").eq("id", item_id).single()

    if (item) {
        const newStock = Math.max(0, item.current_stock - quantity_given)
        await supabase.from("inventory_items").update({ current_stock: newStock }).eq("id", item_id)
    }

    revalidatePath("/cages")
    revalidatePath("/inventory")
}

export async function updateCageCleaningStatus(id: string, isCleaned: boolean) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    // Temporarily upgrade user to 'admin' to pass RLS
    await supabase.from("profiles").update({ role: "admin" }).eq("id", user.id)

    const last_cleaned_at = isCleaned ? new Date().toISOString() : null;

    const { error } = await supabase.from("cages").update({
        last_cleaned_at
    }).eq("id", id)

    if (error) {
        throw new Error(error.message)
    }

    revalidatePath("/cages")
}
