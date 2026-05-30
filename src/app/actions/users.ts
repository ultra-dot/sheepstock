'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAuditLog } from '@/lib/audit'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Type definition for Profile
export type UserProfile = {
    id: string;
    role: string;
    name: string;
    phone: string | null;
    created_at: string;
    last_sign_in_at?: string;
    last_seen?: string;
    owner_id?: string | null;
    referral_code?: string | null;
}

export async function getEffectiveUserId(): Promise<string> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Akses ditolak")

    const { data: profile } = await supabase
        .from('profiles')
        .select('role, owner_id')
        .eq('id', user.id)
        .single()

    if (profile?.role === 'staff' && profile.owner_id) {
        return profile.owner_id
    }
    return user.id
}

export async function getOwnerReferralCode(): Promise<string | null> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data: profile } = await supabase
        .from('profiles')
        .select('referral_code')
        .eq('id', user.id)
        .single()

    return profile?.referral_code || null
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

    if (currentUserProfile?.role !== 'owner' && currentUserProfile?.role !== 'admin') {
        throw new Error("Anda tidak memiliki akses ke halaman ini.")
    }

    let profiles: any[] = [];
    
    if (currentUserProfile?.role === 'owner') {
        // Owner hanya bisa melihat diri sendiri dan staff mereka
        const { data: viewData, error: viewError } = await supabase
            .from('profiles_last_seen')
            .select('*')
            .or(`id.eq.${user.id},owner_id.eq.${user.id}`)
            .order('created_at', { ascending: false });

        if (!viewError && viewData) {
            profiles = viewData;
        } else {
            const { data: tableData } = await supabase
                .from('profiles')
                .select('*')
                .or(`id.eq.${user.id},owner_id.eq.${user.id}`)
                .order('created_at', { ascending: false });
            profiles = tableData || [];
        }
    } else {
        // Admin platform melihat semuanya
        const { data: viewData, error: viewError } = await supabase
            .from('profiles_last_seen')
            .select('*')
            .order('created_at', { ascending: false });

        if (!viewError && viewData) {
            profiles = viewData;
        } else {
            const { data: tableData } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });
            profiles = tableData || [];
        }
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

    if (currentUserProfile?.role !== 'owner' && currentUserProfile?.role !== 'admin') {
        throw new Error("Hanya owner atau admin yang dapat mengubah peran pegawai.")
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

    // Jika owner, pastikan target adalah staff milik owner tersebut
    if (currentUserProfile?.role === 'owner' && oldProfile?.owner_id !== user.id) {
        throw new Error("Anda hanya dapat mengelola staf peternakan Anda sendiri.")
    }

    // Update role and force return data to verify
    const { data: updatedProfile, error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', targetUserId)
        .select()
        .single()

    if (error || !updatedProfile) {
        console.error("Gagal mengubah role:", error)
        throw new Error("Gagal mengubah role pegawai. Pastikan Anda punya izin.")
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

export async function deleteUserProfile(targetUserId: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Akses ditolak")

    const { data: currentUserProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (currentUserProfile?.role !== 'owner' && currentUserProfile?.role !== 'admin') {
        throw new Error("Hanya owner atau admin yang dapat menghapus pegawai.")
    }

    if (targetUserId === user.id) {
        throw new Error("Anda tidak dapat menghapus akun Anda sendiri.")
    }

    // Ambil data sebelum delete untuk log audit
    const { data: oldProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', targetUserId)
        .single()

    // Jika owner, pastikan target adalah staff milik owner tersebut atau profil tanpa owner (orphan)
    if (currentUserProfile?.role === 'owner' && oldProfile?.owner_id !== null && oldProfile?.owner_id !== user.id) {
        throw new Error("Anda hanya dapat menghapus staf peternakan Anda sendiri.")
    }

    // Hapus profile
    const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', targetUserId)

    if (error) {
        console.error("Gagal menghapus pegawai:", error)
        throw new Error("Gagal menghapus pegawai dari sistem.")
    }

    // Log the change
    await createAuditLog(
        "DELETE",
        "profiles",
        `Menghapus pegawai ${oldProfile?.name} dari sistem`,
        targetUserId,
        oldProfile,
        null
    )

    revalidatePath('/settings/users')
    revalidatePath('/dashboard')
}

export async function createStaffAccount(
    name: string,
    email: string,
    phone: string | null,
    password: string
) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Akses ditolak")

    const { data: currentUserProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (currentUserProfile?.role !== 'owner' && currentUserProfile?.role !== 'admin') {
        throw new Error("Hanya owner atau admin yang dapat membuat akun staf langsung.")
    }

    if (!password || password.length < 6) {
        throw new Error("Kata sandi minimal 6 karakter.")
    }

    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceRoleKey) {
        throw new Error("Server belum dikonfigurasi untuk membuat akun staf. Hubungi administrator (SUPABASE_SERVICE_ROLE_KEY tidak ditemukan).")
    }

    // Gunakan admin client dengan service role key
    // Ini memungkinkan pembuatan user yang langsung terverifikasi tanpa konfirmasi email
    const adminSupabase = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        serviceRoleKey
    )

    const { data, error: createError } = await adminSupabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // <-- langsung terverifikasi, bisa login tanpa cek email
        user_metadata: {
            full_name: name,
            role: 'staff_direct',
            owner_id: user.id
        }
    })

    if (createError || !data?.user) {
        const msg = createError?.message || "Gagal membuat akun staf."
        // Handle common error
        if (msg.includes('already been registered') || msg.includes('already exists')) {
            throw new Error("Email sudah terdaftar. Gunakan email lain.")
        }
        throw new Error(msg)
    }

    // Update profil untuk nama lengkap dan nomor telepon
    const { error: profileError } = await supabase
        .from('profiles')
        .update({
            name: name,
            phone: phone || null
        })
        .eq('id', data.user.id)

    if (profileError) {
        console.error("Gagal memperbarui info profil staf:", profileError)
    }

    // Log audit
    await createAuditLog(
        "CREATE",
        "profiles",
        `Membuat akun staf baru: ${name} (${email})`,
        data.user.id,
        null,
        { id: data.user.id, name, role: 'staff', owner_id: user.id, phone }
    )

    revalidatePath('/settings/users')
    return { success: true }
}
