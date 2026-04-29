"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function updateStock(itemId: string, quantity: number, type: 'in' | 'out') {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    if (!itemId) throw new Error("ID barang tidak valid")
    if (quantity <= 0) throw new Error("Jumlah harus lebih dari 0")

    // Get current stock
    const { data: item, error: fetchError } = await supabase.from("inventory_items").select("current_stock, name").eq("id", itemId).single()
    if (fetchError || !item) {
        throw new Error("Barang tidak ditemukan")
    }

    let newStock = item.current_stock;
    if (type === 'in') {
        newStock += quantity;
    } else {
        newStock -= quantity;
        if (newStock < 0) {
            throw new Error(`Stok ${item.name} tidak mencukupi. Sisa stok: ${item.current_stock}`);
        }
    }

    const { error: updateError } = await supabase.from("inventory_items").update({
        current_stock: newStock
    }).eq("id", itemId)

    if (updateError) {
        throw new Error(updateError.message)
    }

    revalidatePath("/inventory")
}

export async function addInventoryItem(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    const name = formData.get("name") as string
    const type = formData.get("type") as string
    const unit = formData.get("unit") as string
    const current_stock = parseFloat(formData.get("current_stock") as string)
    const min_stock_alert = parseFloat(formData.get("min_stock_alert") as string)

    if (!name || !type || !unit) throw new Error("Semua field wajib diisi")
    if (isNaN(current_stock) || current_stock < 0) throw new Error("Stok awal harus angka positif")
    if (isNaN(min_stock_alert) || min_stock_alert < 0) throw new Error("Batas minimum harus angka positif")

    const { error } = await supabase.from("inventory_items").insert({
        name,
        type,
        unit,
        current_stock,
        min_stock_alert,
        user_id: user.id
    })

    if (error) {
        throw new Error(error.message)
    }

    revalidatePath("/inventory")
}

export async function deleteInventoryItem(itemId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    const { error } = await supabase.from("inventory_items").delete().eq("id", itemId).eq("user_id", user.id)

    if (error) {
        throw new Error(error.message)
    }

    revalidatePath("/inventory")
}
