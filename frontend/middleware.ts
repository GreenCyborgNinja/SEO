import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

const SESSION_COOKIE = 'dt_sid'
const SESSION_MAX_AGE = 60 * 60 * 24 * 180 // 180 days

const AUTH_SECRET =
  process.env.AUTH_SECRET?.trim() || 'daily-trends-local-development-secret-do-not-use-in-production'

/**
 * Two jobs:
 *
 * 1. Issue the anonymous analytics session id — the join key between pageviews
 *    and affiliate clicks, which is what makes CTR and "customers also viewed"
 *    work without a third-party tracker.
 * 2. Keep unauthenticated traffic out of /account and non-admins out of /admin.
 *    This is routing, not authorization: both areas re-check server-side.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/account') || pathname.startsWith('/admin')) {
    const token = await getToken({
      req: request,
      secret: AUTH_SECRET,
      // Must follow the protocol, not NODE_ENV: Auth.js only adds the
      // `__Secure-` cookie prefix on https. A production build served over
      // http://localhost (our documented local setup) uses the unprefixed name,
      // and guessing wrong here logs everyone out of /account and /admin.
      secureCookie: request.nextUrl.protocol === 'https:',
    })

    if (!token) {
      const login = new URL('/login', request.url)
      login.searchParams.set('next', pathname)
      return NextResponse.redirect(login)
    }

    if (pathname.startsWith('/admin') && token.role !== 'admin') {
      return NextResponse.redirect(new URL('/account', request.url))
    }
  }

  const response = NextResponse.next()

  if (!request.cookies.get(SESSION_COOKIE)) {
    response.cookies.set(SESSION_COOKIE, crypto.randomUUID(), {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_MAX_AGE,
      secure: process.env.NODE_ENV === 'production',
    })
  }

  return response
}

export const config = {
  // Skip static assets and Next internals — they must not pay the cookie cost.
  matcher: ['/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)'],
}
