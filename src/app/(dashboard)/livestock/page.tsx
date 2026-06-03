import { createClient } from "@/lib/supabase/server"
import { LivestockClient } from "@/components/dashboard/livestock-client"

export const dynamic = 'force-dynamic'

export default async function LivestockPage() {
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

    // Fetch livestock joined with cage data
    const { data: livestocks, error } = await supabase
        .from("livestocks")
        .select(`
            *,
            cages ( name )
        `)
        .order('entry_date', { ascending: false })

    // Fetch cages for the dropdowns
    const { data: cages } = await supabase.from("cages").select("id, name, capacity, current_occupancy").order('name');

    if (error || !livestocks) {
        return <div className="p-6">Gagal memuat data inventori ternak.</div>
    }

    // Calculations for bottom stats
    const activeLivestocks = livestocks.filter(l => l.status !== 'sold');
    const soldCount = livestocks.filter(l => l.status === 'sold').length;
    
    const totalAnimals = activeLivestocks.length;
    const healthyCount = activeLivestocks.filter(l => l.status === 'healthy').length;
    const healthyPercentage = totalAnimals > 0 ? Math.round((healthyCount / totalAnimals) * 100) : 0;

    // Average weight
    const totalWeight = activeLivestocks.reduce((sum, l) => sum + (l.current_weight || 0), 0);
    const avgWeight = totalAnimals > 0 ? (totalWeight / totalAnimals).toFixed(1) : "0";

    // Siap Panen (e.g. weight >= 35 kg rule of thumb)
    const readyToHarvest = activeLivestocks.filter(l => l.current_weight >= 35).length;

    // Fetch medicine/obat items for the edit form dropdown
    const { data: medicines } = await supabase
        .from("inventory_items")
        .select("id, name, current_stock, unit")
        .in("type", ["obat", "medicine", "vaksin", "vaccine"])
        .order('name')

    return (
        <LivestockClient
            livestocks={livestocks}
            cages={cages || []}
            medicines={medicines || []}
            avatarUrl={avatarUrl}
            userName={userName}
            stats={{ totalAnimals, healthyPercentage, avgWeight, readyToHarvest, soldCount }}
        />
    )
}
