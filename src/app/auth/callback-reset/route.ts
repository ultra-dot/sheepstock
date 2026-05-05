import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Password reset callback → Reset Password Page
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const code = searchParams.get('code')

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error) {
            // Session is now active, redirect to the reset password form
            return NextResponse.redirect(`${baseUrl}/reset-password`)
        }
    }

    // If no code or exchange failed, redirect to forgot-password to try again
    return NextResponse.redirect(`${baseUrl}/forgot-password`)
}
