import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value
                },
                set(name: string, value: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    response.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                },
                remove(name: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    response.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                },
            },
        }
    )

    const { data: { session } } = await supabase.auth.getSession()

    const isAuthPage = request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/vendor/login'
    const isVendorRoute = request.nextUrl.pathname.startsWith('/vendor') && request.nextUrl.pathname !== '/vendor/login'
    const isStudentRoute = request.nextUrl.pathname.startsWith('/home') ||
        request.nextUrl.pathname.startsWith('/stall') ||
        request.nextUrl.pathname.startsWith('/cart') ||
        request.nextUrl.pathname.startsWith('/orders') ||
        request.nextUrl.pathname.startsWith('/profile') ||
        request.nextUrl.pathname.startsWith('/about')

    // Redirect to login if not authenticated and trying to access protected routes
    if (!session && (isVendorRoute || isStudentRoute)) {
        if (request.nextUrl.pathname.startsWith('/vendor')) {
            return NextResponse.redirect(new URL('/vendor/login', request.url))
        }
        return NextResponse.redirect(new URL('/login', request.url))
    }

    // Redirect to home if authenticated and trying to access login page
    if (session && isAuthPage) {
        return NextResponse.redirect(new URL('/home', request.url))
    }

    return response
}

export const config = {
    matcher: [
        '/login',
        '/home/:path*',
        '/stall/:path*',
        '/cart/:path*',
        '/orders/:path*',
        '/profile/:path*',
        '/about/:path*',
        '/vendor/:path*',
    ],
}
