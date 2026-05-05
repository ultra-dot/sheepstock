import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Password reset callback → Reset Password Page
export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error) {
            // Session is now active, redirect to the reset password form
            return NextResponse.redirect(`${origin}/reset-password`)
        }
    }

    // If no code or exchange failed, redirect to forgot-password to try again
    return NextResponse.redirect(`${origin}/forgot-password`)
}
