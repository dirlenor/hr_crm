import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { User, Session } from '@supabase/supabase-js'

type CreateClientResult = {
  supabase: ReturnType<typeof createServerClient>
  user: User | null
  session: Session | null
}

export async function createClient(): Promise<CreateClientResult> {
  const cookieStore = await cookies()
  
  // Find auth cookie
  const allCookies = cookieStore.getAll()
  const authCookie = allCookies.find(c => c.name.includes('supabase') || c.name.includes('auth'))

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
  
  // Get user and session
  // Try getSession first (more reliable)
  const { data: { session }, error: sessionError } = await client.auth.getSession()
  
  let user: User | null = null
  
  if (session?.user) {
    user = session.user
  } else {
    // Fallback: try getUser
    const { data: { user: fetchedUser }, error: userError } = await client.auth.getUser()
    user = fetchedUser
  }
  
  // If still no user, try manual cookie parsing as fallback
  if (!user && authCookie?.value) {
    try {
      let cookieValue = authCookie.value
      if (cookieValue.includes('%')) {
        cookieValue = decodeURIComponent(cookieValue)
      }
      
      const sessionData = JSON.parse(cookieValue)
      
      if (sessionData.access_token && sessionData.refresh_token) {
        const { data: setSessionData, error: setSessionError } = await client.auth.setSession({
          access_token: sessionData.access_token,
          refresh_token: sessionData.refresh_token,
        })
        
        user = setSessionData.user
        if (setSessionData.session) {
          return { supabase: client, user, session: setSessionData.session }
        }
      }
    } catch (parseError: any) {
      // Cookie parse error - ignore
    }
  }
  
  return { supabase: client, user, session }
}
