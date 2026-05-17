import { createClient } from "@/lib/supabase/server"
import { HarvestClient } from "@/components/dashboard/harvest-client"

export const dynamic = 'force-dynamic'

export default async function HarvestPage() {
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

    // Fetch ALL active livestocks (not sold, not dead) so we can scan and sell any sheep via "Jual Hidup"
    const { data: allActiveLivestock } = await supabase
        .from("livestocks")
        .select(`
            *,
            cages ( name )
        `)
        .not("status", "eq", "sold")
        .not("status", "eq", "dead")
        .order("current_weight", { ascending: false });

    // Fetch harvest history
    const { data: harvestHistory } = await supabase
        .from("harvest_records")
        .select(`
            *,
            livestocks ( qr_code, type, gender )
        `)
        .order("harvest_date", { ascending: false });

    return (
        <HarvestClient
            allActiveLivestock={allActiveLivestock || []}
            harvestHistory={harvestHistory || []}
            avatarUrl={avatarUrl}
            userName={userName}
        />
    )
}
