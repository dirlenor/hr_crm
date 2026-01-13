import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  let supabaseResponse = await updateSession(request)
  
  // Skip middleware for static files and API routes
  if (
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.startsWith('/api') ||
    request.nextUrl.pathname.startsWith('/auth/callback')
  ) {
    return supabaseResponse
  }
  
  // Check if user has profile for protected routes
  if (
    request.nextUrl.pathname.startsWith('/admin') ||
    request.nextUrl.pathname === '/onboarding'
  ) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            )
            supabaseResponse = NextResponse.next({
              request,
            })
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      // Use RPC function to check if user has org (bypasses RLS issues)
      const { data: orgId, error: orgError } = await supabase.rpc('get_user_org_id', {
        user_id: user.id,
      })
      
      const hasProfile = orgId !== null && !orgError

      // If accessing /onboarding but already has profile, redirect to admin dashboard
      if (request.nextUrl.pathname === '/onboarding' && hasProfile) {
        const url = new URL('/admin/dashboard', request.url)
        return NextResponse.redirect(url)
      }
      
      // If accessing /admin (root), redirect to dashboard
      if (request.nextUrl.pathname === '/admin') {
        const url = new URL('/admin/dashboard', request.url)
        return NextResponse.redirect(url)
      }

      // If accessing /admin but no profile, redirect to onboarding
      if (request.nextUrl.pathname.startsWith('/admin') && !hasProfile) {
        const url = new URL('/onboarding', request.url)
        return NextResponse.redirect(url)
      }
      
      // If has profile and accessing /admin, allow through - don't redirect
    } else {
      // No user, redirect to sign-in if accessing protected routes
      if (request.nextUrl.pathname.startsWith('/admin')) {
        const url = new URL('/auth/sign-in', request.url)
        return NextResponse.redirect(url)
      }
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
