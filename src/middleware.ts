import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'

const PUBLIC_PATHS = ['/', '/login', '/legal', '/designs']
const PUBLIC_PREFIXES = ['/verify/', '/view/', '/api/auth/', '/api/ai/']

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Laisser passer les routes publiques
  if (PUBLIC_PATHS.includes(pathname)) return NextResponse.next()
  if (PUBLIC_PREFIXES.some(p => pathname.startsWith(p))) return NextResponse.next()

  // Vérifier le token JWT
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })

  // Pas connecté → redirect login
  if (!token) {
    const url = req.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(url)
  }

  // Protéger les routes admin
  if (pathname.startsWith('/admin')) {
    const isSuperAdmin = (token as any).isSuperAdmin === true
    if (!isSuperAdmin) {
      const url = req.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico|icon\\.png|.*\\.svg|.*\\.png|.*\\.jpg).*)',
  ],
}
