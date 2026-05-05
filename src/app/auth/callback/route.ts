import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// General auth callback (email verification, etc.) → Dashboard
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const code = searchParams.get('code')

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error) {
            return NextResponse.redirect(`${baseUrl}/dashboard`)
        }
    }

    // If no code or exchange failed, redirect to login
    return NextResponse.redirect(`${baseUrl}/login`)
}
