import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AuditLogsClient } from "@/components/dashboard/audit-logs-client"

export default async function AuditLogsPage() {
    const supabase = await createClient()

    // 1. Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect("/login")

    // 2. Verify Role (Admin only)
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (!profile || profile.role !== 'admin') {
        redirect("/dashboard")
    }

    // 3. Fetch Audit Logs
    const { data: logs, error } = await supabase
        .from('audit_logs')
        .select(`
            *,
            profiles:user_id (name)
        `)
        .order('created_at', { ascending: false })
        .limit(100)

    return <AuditLogsClient logs={logs || []} />
}
