import { createClient } from "@/lib/supabase/server"
import { InventoryClient } from "@/components/dashboard/inventory-client"

export const dynamic = 'force-dynamic'

export default async function InventoryPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser();
    let avatarUrl = "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=100&h=100"; // fallback

    if (user && user.user_metadata?.avatar_url) {
        avatarUrl = user.user_metadata.avatar_url;
    }

    const { data: items, error } = await supabase
        .from("inventory_items")
        .select("*")
        .order('type')

    if (error || !items) {
        return <div className="p-6">Gagal memuat data inventori gudang.</div>
    }

    const totalItems = items.length;
    const lowStockItems = items.filter(i => i.current_stock <= i.min_stock_alert).length;
    // Estimated valuation based on total price logic (if we had price, fallback to string)
    const totalEstValue = "Rp 12.4M"; // Placeholder based on original design

    return (
        <InventoryClient 
            items={items} 
            avatarUrl={avatarUrl} 
            totalItems={totalItems} 
            lowStockItems={lowStockItems} 
            totalEstValue={totalEstValue} 
        />
    )
}
