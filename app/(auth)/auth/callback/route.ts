import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { syncLineProfile } from '@/actions/org'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const { supabase, user } = await createClient()

  if (code) {
    await supabase.auth.exchangeCodeForSession(code)
    
    // Re-fetch user after exchange
    const { data: { user: newUser } } = await supabase.auth.getUser()
    
    // Sync LINE profile if LINE OAuth
    if (newUser && newUser.app_metadata?.provider === 'line') {
      await syncLineProfile(newUser.id)
    }
  }

  return NextResponse.redirect(new URL('/onboarding', request.url))
}
