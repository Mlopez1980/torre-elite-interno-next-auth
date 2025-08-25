import { NextResponse } from 'next/server'

export function middleware(req){
  const auth = req.headers.get('authorization')
  const USER = process.env.BASIC_AUTH_USER || 'equipo'
  const PASS = process.env.BASIC_AUTH_PASS || 'TorreElite2025!'

  if (auth) {
    const [scheme, encoded] = auth.split(' ')
    if (scheme === 'Basic' && encoded) {
      const decoded = atob(encoded) // "user:pass"
      const [user, pass] = decoded.split(':')
      if (user === USER && pass === PASS) {
        return NextResponse.next()
      }
    }
  }

  return new NextResponse('Auth required', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Torre Élite (Interno)"' }
  })
}

// Protect all routes (pages and API). Static assets are fetched after auth.
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
}
