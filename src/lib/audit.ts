import { createClient } from '@/lib/supabase/server';

export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE';

export async function createAuditLog(
    action: AuditAction,
    entityType: string,
    description: string,
    entityId?: string,
    oldData?: any,
    newData?: any
) {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
        console.error('Audit Log failed: No authenticated user');
        return { success: false, error: 'User not authenticated' };
    }

    try {
        const { error } = await supabase.from('audit_logs').insert({
            user_id: user.id,
            action,
            entity_type: entityType,
            description,
            ...(entityId && { entity_id: entityId }),
            ...(oldData && { old_data: oldData }),
            ...(newData && { new_data: newData })
        });

        if (error) {
            console.error('Failed to create audit log:', error);
            return { success: false, error };
        }

        return { success: true };
    } catch (e) {
        console.error('Audit Log exception:', e);
        return { success: false, error: e };
    }
}
