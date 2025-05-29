import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  console.log('🔒 Middleware: Processing path:', pathname)

  // Tạo supabase client để check session
  try {
    const supabase = await createClient()
    const { data: { session }, error } = await supabase.auth.getSession()

    console.log('🔒 Middleware: Session check:', {
      hasSession: !!session,
      hasUser: !!session?.user,
      userId: session?.user?.id,
      error: error?.message
    })

    // Chặn người dùng đã đăng nhập truy cập login/register
    const authPages = ['/login', '/register']
    if (authPages.includes(pathname) && session) {
      console.log('🔒 Middleware: Redirecting authenticated user away from auth pages')
      return NextResponse.redirect(new URL('/', request.url))
    }

    // Chặn người dùng chưa đăng nhập truy cập protected pages
    const protectedPages = ['/profile', '/bookmarks']
    if (protectedPages.includes(pathname) && !session) {
      console.log('🔒 Middleware: Redirecting unauthenticated user to login')
      return NextResponse.redirect(new URL('/login', request.url))
    }

    console.log('🔒 Middleware: Allowing access to:', pathname)
    return NextResponse.next()
  } catch (error) {
    console.error('🔒 Middleware: Error:', error)
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     * - api routes
     */
    '/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
