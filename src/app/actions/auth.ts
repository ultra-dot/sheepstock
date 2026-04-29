'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(prevState: any, formData: FormData) {
    const supabase = await createClient()

    const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
    }

    const { error } = await supabase.auth.signInWithPassword(data)

    if (error) {
        // Return error message to be handled by the UI
        return { error: 'Username atau Password salah.' }
    }

    revalidatePath('/', 'layout')
    redirect('/')
}

export async function logout() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
}

export async function register(prevState: any, formData: FormData) {
    const supabase = await createClient()

    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const passwordConfirm = formData.get('passwordConfirm') as string

    if (password !== passwordConfirm) {
        return { error: 'Konfirmasi kata sandi tidak cocok.' }
    }

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: name,
            }
        }
    })

    if (error) {
        return { error: error.message || 'Terjadi kesalahan saat pendaftaran.' }
    }

    if (data?.user) {
        // Force update profile to ensure it matches the registered name instead of DB defaults
        await supabase.from('profiles').update({ name: name }).eq('id', data.user.id);
    }

    redirect('/login')
}
