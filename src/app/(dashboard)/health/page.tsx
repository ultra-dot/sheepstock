import { createClient } from "@/lib/supabase/server"
import { HealthClient } from "@/components/dashboard/health-client"

export const dynamic = 'force-dynamic'

export default async function HealthPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser();
    let avatarUrl: string | null = null;

    if (user && user.user_metadata?.avatar_url) {
        avatarUrl = user.user_metadata.avatar_url;
    }

    // Fetch health records joined with livestock and items
    const { data: records } = await supabase
        .from("health_records")
        .select(`
      *,
      livestocks ( qr_code, type, gender ),
      inventory_items ( name )
    `)
        .order('date', { ascending: false })

    // Fetch all livestocks with cage_id for filtering
    const { data: livestocks } = await supabase
        .from("livestocks")
        .select("id, qr_code, type, cage_id")
        .in("status", ["healthy", "sick"])
        .order('qr_code')

    // Fetch cages for cage dropdown
    const { data: cages } = await supabase
        .from("cages")
        .select("id, name")
        .order('name')

    // Fetch medicine/obat items for the add form dropdown
    const { data: medicines } = await supabase
        .from("inventory_items")
        .select("id, name, current_stock, unit")
        .in("type", ["obat", "medicine", "vaksin", "vaccine"])
        .order('name')

    return (
        <HealthClient
            records={records || []}
            livestocks={livestocks || []}
            cages={cages || []}
            medicines={medicines || []}
            avatarUrl={avatarUrl}
        />
    )
}
