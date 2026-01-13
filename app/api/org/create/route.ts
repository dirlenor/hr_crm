import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json()
    
    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { error: 'Organization name is required' },
        { status: 400 }
      )
    }

    // Try to get auth token from Authorization header first
    const authHeader = request.headers.get('Authorization')
    let user = null
    let supabaseResponse = NextResponse.next({ request })
    
    // Create Supabase client - reuse the same instance for all operations
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
            cookiesToSet.forEach(({ name, value, options }) =>
              request.cookies.set(name, value)
            )
            supabaseResponse = NextResponse.next({ request })
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            )
          },
        },
        global: authHeader && authHeader.startsWith('Bearer ') ? {
          headers: {
            Authorization: authHeader,
          },
        } : undefined,
      }
    )
    
    let session = null
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      // Use token from Authorization header
      const token = authHeader.replace('Bearer ', '')
      const { data: { user: tokenUser }, error: tokenError } = await supabase.auth.getUser(token)
      if (!tokenError && tokenUser) {
        user = tokenUser
        // Get session to ensure auth context is set
        const { data: { session: tokenSession } } = await supabase.auth.getSession()
        session = tokenSession
      }
    }
    
    // Fallback to cookies if token auth failed
    if (!user) {
      const {
        data: { user: cookieUser },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !cookieUser) {
        console.error('Auth error in API route:', authError)
        console.error('Cookies:', request.cookies.getAll().map(c => c.name))
        return NextResponse.json(
          { error: 'Not authenticated' },
          { status: 401 }
        )
      }
      
      user = cookieUser
      const { data: { session: cookieSession } } = await supabase.auth.getSession()
      session = cookieSession
    }
    
    // Ensure session is set for RLS policies - this is critical for auth.uid() to work
    if (!session) {
      const { data: { session: fetchedSession } } = await supabase.auth.getSession()
      session = fetchedSession
    }
    
    // Set session explicitly to ensure RLS policies can access auth.uid()
    if (session?.access_token) {
      const { error: setSessionError } = await supabase.auth.setSession({
        access_token: session.access_token,
        refresh_token: session.refresh_token || '',
      })
      if (setSessionError) {
        console.error('Error setting session:', setSessionError)
        // Continue anyway - session might already be set
      }
    }

    // Check if user already has a profile
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single()

    if (existingProfile) {
      return NextResponse.json(
        { error: 'User already belongs to an organization' },
        { status: 400 }
      )
    }

    // Get user metadata
    const userMetadata = user.user_metadata || {}
    const authProvider = userMetadata.provider === 'line' ? 'line' : 'email'
    const lineUserId = userMetadata.sub || userMetadata.line_user_id || null
    const displayName = userMetadata.name || userMetadata.display_name || user.email || null
    const avatarUrl = userMetadata.picture || userMetadata.avatar_url || null

    // Create org and profile using RPC function
    // This function uses SECURITY DEFINER to bypass RLS
    console.log('Creating org with name:', name, 'for user:', user.id)
    
    const { data: orgId, error: rpcError } = await supabase.rpc('create_org_with_profile', {
      org_name: name,
      user_id: user.id,
      user_email: user.email || '',
      display_name: displayName,
      avatar_url: avatarUrl,
      auth_provider: authProvider,
      line_user_id: lineUserId,
    })

    if (rpcError || !orgId) {
      console.error('Error creating org via RPC:', rpcError)
      return NextResponse.json(
        { error: rpcError?.message || 'Failed to create organization' },
        { status: 500 }
      )
    }
    
    console.log('Org created successfully:', orgId)

    revalidatePath('/onboarding')
    
    // Return response with updated cookies
    const response = NextResponse.json({ success: true })
    // Copy cookies from supabaseResponse to maintain session
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      response.cookies.set(cookie.name, cookie.value, {
        path: cookie.path,
        domain: cookie.domain,
        maxAge: cookie.maxAge,
        expires: cookie.expires,
        httpOnly: cookie.httpOnly,
        secure: cookie.secure,
        sameSite: cookie.sameSite as 'strict' | 'lax' | 'none' | undefined,
      })
    })
    
    return response
  } catch (error: any) {
    console.error('Unexpected error in createOrg API:', error)
    console.error('Error stack:', error?.stack)
    return NextResponse.json(
      { 
        error: error?.message || 'An unexpected error occurred',
        details: process.env.NODE_ENV === 'development' ? error?.stack : undefined
      },
      { status: 500 }
    )
  }
}
