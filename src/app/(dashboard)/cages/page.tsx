import { createClient } from "@/lib/supabase/server"
import { CagesClient } from "@/components/dashboard/cages-client"

export const dynamic = 'force-dynamic'

export default async function CagesPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser();
    let avatarUrl: string | null = null;

    if (user && user.user_metadata?.avatar_url) {
        avatarUrl = user.user_metadata.avatar_url;
    }

    // Fetch all cages
    const { data: cages, error: cagesError } = await supabase
        .from("cages")
        .select("*")
        .order("name")

    // Fetch all livestock to calculate gender/age distribution and show in details modal
    const { data: livestocks, error: livestockError } = await supabase
        .from("livestocks")
        .select("*")
        .in("status", ["healthy", "sick"]) // only count active animals

    if (!cages) return <div className="p-6">Gagal memuat data kandang.</div>

    // Calculate stats for each cage
    const cagesWithStats = cages.map(cage => {
        const occupants = livestocks?.filter(l => l.cage_id === cage.id) || []

        const maleCount = occupants.filter(l => l.gender === 'male').length
        const femaleCount = occupants.filter(l => l.gender === 'female').length

        const capacityPercentage = Math.round((cage.current_occupancy / cage.capacity) * 100)

        // Maps to specific CSS classes from the Google Stitch design
        let statusDot = "bg-emerald-500"
        let statusText = "text-emerald-600"
        let statusLabel = "Tersedia"
        let progressColor = "bg-emerald-500"
        let progressBg = "bg-emerald-500/10"

        if (cage.status === 'full' || capacityPercentage >= 100) {
            statusDot = "bg-amber-400"
            statusText = "text-amber-600"
            statusLabel = "Penuh"
            progressColor = "bg-amber-400"
            progressBg = "bg-amber-400/10"
        } else if (cage.status === 'maintenance') {
            statusDot = "bg-rose-500"
            statusText = "text-rose-600"
            statusLabel = "Perbaikan"
            progressColor = "bg-rose-500"
            progressBg = "bg-rose-500/10"
        } else if (capacityPercentage > 80) {
            statusLabel = "Aman" // mostly full but not 100%
        }

        return {
            ...cage,
            stats: { maleCount, femaleCount },
            occupants,
            capacityPercentage: Math.min(capacityPercentage, 100),
            ui: { statusDot, statusText, statusLabel, progressColor, progressBg }
        }
    })

    // Fetch feed items
    const { data: feedItems } = await supabase
        .from("inventory_items")
        .select("id, name, current_stock, unit")
        .eq("type", "feed")
        .gt("current_stock", 0)
        .order("name")

    return (
        <CagesClient
            cagesWithStats={cagesWithStats}
            feedItems={feedItems || []}
            avatarUrl={avatarUrl}
        />
    )
}
