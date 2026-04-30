import { createClient } from "@/lib/supabase/server"
import { QrTagsClient } from "./qr-tags-client"

export const dynamic = 'force-dynamic'

export default async function QrTagsPage() {
    const supabase = await createClient()

    // Fetch livestocks with cage relations for better filtering
    const { data: livestocks, error } = await supabase
        .from("livestocks")
        .select(`
            id,
            qr_code,
            gender,
            status,
            cage_id,
            cages ( name )
        `)
        .order('id', { ascending: true })

    if (error || !livestocks) {
        return <div className="p-8 text-center text-slate-500">Gagal memuat data ternak.</div>
    }

    return <QrTagsClient livestocks={livestocks} />
}
