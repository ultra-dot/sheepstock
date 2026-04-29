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
