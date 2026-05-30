import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { UsersClient } from "@/components/dashboard/users-client"
import { getAllProfiles } from "@/app/actions/users"

export const dynamic = 'force-dynamic'

export default async function UsersPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Check role
    const { data: profile } = await supabase.from('profiles').select('name, role').eq('id', user.id).single()

    if (profile?.role !== 'admin') {
        redirect('/dashboard')
    }

    let userName = "Admin Peternakan"
    let avatarUrl = null

    if (profile?.name && profile.name !== "New Staff") {
        userName = profile.name
    } else if (user.user_metadata?.full_name) {
        userName = user.user_metadata.full_name
    }

    if (user.user_metadata?.avatar_url) {
        avatarUrl = user.user_metadata.avatar_url
    }

    const profiles = await getAllProfiles()

    return (
        <UsersClient 
            initialProfiles={profiles}
            currentUserId={user.id}
            userName={userName}
            avatarUrl={avatarUrl}
        />
    )
}
