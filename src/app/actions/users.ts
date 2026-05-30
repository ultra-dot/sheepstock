'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAuditLog } from '@/lib/audit'

// Type definition for Profile
export type UserProfile = {
    id: string;
    role: string;
    name: string;
    phone: string | null;
    created_at: string;
    last_sign_in_at?: string;
    last_seen?: string;
}

export async function getAllProfiles(): Promise<UserProfile[]> {
    const supabase = await createClient()

    // Ambil data user yang sedang login untuk ngecek akses
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Akses ditolak")

    const { data: currentUserProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (currentUserProfile?.role !== 'admin') {
        throw new Error("Anda tidak memiliki akses ke halaman ini.")
    }

    // Coba ambil dari admin_users_view (yang punya info last_sign_in_at)
    // Jika belum di-migrate, fallback ke tabel profiles biasa
    let profiles: any[] = [];
    const { data: viewData, error: viewError } = await supabase
        .from('admin_users_view')
        .select('*')
        .order('created_at', { ascending: false });

    if (!viewError && viewData) {
        profiles = viewData;
    } else {
        const { data: tableData, error: tableError } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });
            
        if (tableError) {
            console.error("Gagal mengambil data pegawai:", tableError);
            throw new Error("Gagal mengambil data pegawai.");
        }
        profiles = tableData || [];
    }

    return profiles;
}

export async function updateUserRole(targetUserId: string, newRole: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Akses ditolak")

    const { data: currentUserProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (currentUserProfile?.role !== 'admin') {
        throw new Error("Hanya admin yang dapat mengubah peran pegawai.")
    }

    if (targetUserId === user.id) {
        throw new Error("Anda tidak dapat mengubah role Anda sendiri.")
    }

    // Ambil data sebelum update untuk log audit
    const { data: oldProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', targetUserId)
        .single()

    // Update role and force return data to verify
    const { data: updatedProfile, error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', targetUserId)
        .select()
        .single()

    if (error || !updatedProfile) {
        console.error("Gagal mengubah role:", error)
        throw new Error("Gagal mengubah role pegawai. Pastikan Anda punya izin atau sudah menjalankan SQL Migration.")
    }

    // Log the change
    await createAuditLog(
        "UPDATE",
        "profiles",
        `Mengubah role dari ${oldProfile?.role} menjadi ${newRole} untuk user ${oldProfile?.name}`,
        targetUserId,
        oldProfile,
        updatedProfile
    )

    revalidatePath('/settings/users')
    revalidatePath('/dashboard')
}
