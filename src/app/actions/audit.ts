'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { createAuditLog } from '@/lib/audit'

export async function restoreCheckpoint(logId: string) {
    const supabase = await createClient()

    // 1. Verifikasi Admin Role
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Akses ditolak")

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin' && profile?.role !== 'owner') {
        throw new Error("Hanya owner atau administrator yang dapat melakukan restore data.")
    }

    // 2. Fetch the log
    const { data: log, error: logError } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('id', logId)
        .single()

    if (logError || !log) {
        throw new Error("Log tidak ditemukan.")
    }

    if (!log.old_data && log.action !== 'CREATE') {
        throw new Error("Log ini tidak memiliki data checkpoint (old_data) sehingga tidak dapat di-restore.")
    }

    const entityType = log.entity_type
    const entityId = log.entity_id

    // Map entity_type to actual database table name
    const tableMap: Record<string, string> = {
        'livestock': 'livestocks',
        'cage': 'cages',
        'cages': 'cages',
        'profiles': 'profiles'
    }

    const tableName = tableMap[entityType] || entityType

    // 3. Process Restore Based on Action
    try {
        if (log.action === 'UPDATE') {
            // Restore = Update row back to old_data
            if (!entityId || !log.old_data) throw new Error("ID atau Data lama tidak valid.")
            
            // Filter out foreign key or generated columns that shouldn't be blindly updated if needed, 
            // but since old_data is from the same table, it should be safe.
            const payload = { ...log.old_data }
            
            const { error: updateError } = await supabase
                .from(tableName)
                .update(payload)
                .eq('id', entityId)

            if (updateError) throw updateError

            await createAuditLog(
                'UPDATE',
                entityType,
                `RESTORE: Mengembalikan data ke kondisi sebelum diubah pada ${new Date(log.created_at).toLocaleString('id-ID')}`,
                entityId,
                log.new_data, // the current state before restore
                log.old_data  // the new state after restore
            )
        } 
        else if (log.action === 'DELETE') {
            // Restore = Re-insert the old_data
            if (!log.old_data) throw new Error("Data lama tidak valid.")
            
            const payload = { ...log.old_data }
            
            const { error: insertError } = await supabase
                .from(tableName)
                .insert(payload)

            if (insertError) throw insertError

            await createAuditLog(
                'CREATE',
                entityType,
                `RESTORE: Mengembalikan data yang telah dihapus pada ${new Date(log.created_at).toLocaleString('id-ID')}`,
                payload.id,
                null,
                payload
            )
        }
        else if (log.action === 'CREATE') {
            // Restore = Delete the row
            if (!entityId) throw new Error("ID tidak valid.")
            
            const { error: deleteError } = await supabase
                .from(tableName)
                .delete()
                .eq('id', entityId)

            if (deleteError) throw deleteError

            await createAuditLog(
                'DELETE',
                entityType,
                `RESTORE: Menghapus data yang dibuat pada ${new Date(log.created_at).toLocaleString('id-ID')}`,
                entityId,
                log.new_data,
                null
            )
        }
    } catch (e: any) {
        if (e.code === '23503' || e.message?.includes('foreign key constraint')) {
            throw new Error(`Gagal melakukan restore: Data terkait sudah tidak ada atau akan menyebabkan konflik (Foreign Key Constraint).`)
        }
        throw new Error(`Gagal melakukan restore: ${e.message}`)
    }

    // Revalidate paths so UI updates
    revalidatePath('/settings/audit-logs')
    revalidatePath('/dashboard')
    revalidatePath('/cages')
    revalidatePath('/livestock')
    revalidatePath('/settings/users')
}
