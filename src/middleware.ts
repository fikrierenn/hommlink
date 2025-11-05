import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  let res = NextResponse.next({
    request: {
      headers: req.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value
        },
        set(name: string, value: string, options: Record<string, unknown>) {
          req.cookies.set({
            name,
            value,
            ...options,
          })
          res = NextResponse.next({
            request: {
              headers: req.headers,
            },
          })
          res.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: Record<string, unknown>) {
          req.cookies.set({
            name,
            value: '',
            ...options,
          })
          res = NextResponse.next({
            request: {
              headers: req.headers,
            },
          })
          res.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // Refresh session if expired - required for Server Components
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Check if this is a mobile device
  const userAgent = req.headers.get('user-agent') || ''
  const isMobile = /Mobile|Android|iPhone|iPad/.test(userAgent)

  // Debug logging in development
  if (process.env.NODE_ENV === 'development') {
    console.log('🔒 Middleware check:', {
      path: req.nextUrl.pathname,
      hasSession: !!session,
      userEmail: session?.user?.email,
      isMobile,
      userAgent: userAgent.substring(0, 50) + '...'
    })
  }

  // Define protected routes
  const protectedRoutes = ['/dashboard', '/leads', '/profile', '/settings']
  const authRoutes = ['/login', '/register']
  
  const isProtectedRoute = protectedRoutes.some(route => 
    req.nextUrl.pathname.startsWith(route)
  )
  const isAuthRoute = authRoutes.some(route => 
    req.nextUrl.pathname.startsWith(route)
  )

  // If user is not authenticated and trying to access protected route
  if (!session && isProtectedRoute) {
    if (process.env.NODE_ENV === 'development') {
      console.log('❌ No session, redirecting to login', { isMobile })
    }
    
    // For mobile devices, be more lenient with session checks
    if (isMobile) {
      // Check if there's an auth token in cookies
      const authToken = req.cookies.get('hommlink-auth-token')
      if (authToken) {
        // Let the request through, client-side auth will handle it
        return res
      }
    }
    
    const redirectUrl = new URL('/login', req.url)
    redirectUrl.searchParams.set('redirectTo', req.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // If user is authenticated and trying to access auth routes
  if (session && isAuthRoute) {
    // Check if there's a redirectTo parameter
    const redirectTo = req.nextUrl.searchParams.get('redirectTo')
    if (redirectTo) {
      return NextResponse.redirect(new URL(redirectTo, req.url))
    }
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  // If user is authenticated and on root path, redirect to dashboard
  if (session && req.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return res
}

export const config = {
  matcher: [
    // Temporarily disable middleware to debug redirect issues
    // '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}