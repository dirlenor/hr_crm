import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { User, Session } from '@supabase/supabase-js'

type CreateClientResult = {
  supabase: ReturnType<typeof createServerClient>
  user: User | null
  session: Session | null
}

/**
 * Create Supabase client with proper authentication for RLS
 * WORKAROUND: @supabase/ssr v0.1.0 doesn't parse cookie properly,
 * so we manually parse and set session from auth cookie
 */
export async function createClient(): Promise<CreateClientResult> {
  const cookieStore = await cookies()
  const allCookies = cookieStore.getAll()
  const authCookies = allCookies.filter(c => c.name.includes('auth-token'))

  const client = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
  
  // WORKAROUND: @supabase/ssr v0.1.0 doesn't parse cookie properly
  // Manually parse and set session from auth cookie
  const authCookieForSession = authCookies[0]
  let session: Session | null = null
  
  if (authCookieForSession?.value) {
    try {
      const sessionData = JSON.parse(authCookieForSession.value)
      if (sessionData.access_token && sessionData.refresh_token) {
        // Set session manually
        const { data, error } = await client.auth.setSession({
          access_token: sessionData.access_token,
          refresh_token: sessionData.refresh_token,
        })
        session = data.session
      }
    } catch {
      // Failed to parse cookie, try fallback
    }
  }
  
  // Fallback to getSession if manual parsing failed
  if (!session) {
    const { data: { session: fallbackSession } } = await client.auth.getSession()
    session = fallbackSession
  }
  
  let user: User | null = session?.user || null
  
  // If no session, try getUser (this also sets the JWT in context)
  if (!user) {
    const { data: { user: fetchedUser } } = await client.auth.getUser()
    user = fetchedUser
  }
  
  return { supabase: client, user, session }
}
