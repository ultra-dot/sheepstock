import { createClient } from "@/lib/supabase/server"
import { InventoryClient } from "@/components/dashboard/inventory-client"

export const dynamic = 'force-dynamic'

export default async function InventoryPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser();
    let avatarUrl: string | null = null;
    let userName = "Admin";

    if (user) {
        const { data: profile } = await supabase.from("profiles").select("name").eq("id", user.id).single();
        if (profile?.name && profile.name !== "New Staff") userName = profile.name;
        else if (user.user_metadata?.full_name) userName = user.user_metadata.full_name;
        
        if (user.user_metadata?.avatar_url) avatarUrl = user.user_metadata.avatar_url;
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
            userName={userName}
            totalItems={totalItems} 
            lowStockItems={lowStockItems} 
            totalEstValue={totalEstValue} 
        />
    )
}
