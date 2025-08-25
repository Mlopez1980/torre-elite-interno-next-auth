import { NextResponse } from 'next/server'

function b64decode(input){
  // ASCII-only Base64 decoder (no atob, safe for Edge)
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
  let str = input.replace(/=+$/, '')
  let output = ''
  let buffer = 0, bits = 0
  for (let i = 0; i < str.length; i++){
    const val = chars.indexOf(str[i])
    if (val === -1) continue
    buffer = (buffer << 6) | val
    bits += 6
    if (bits >= 8){
      bits -= 8
      output += String.fromCharCode((buffer >> bits) & 0xff)
      buffer &= (1 << bits) - 1
    }
  }
  return output
}

function unauthorized(){
  return new NextResponse('Auth required', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Torre Elite (Interno)"' } // ASCII-only
  })
}

export function middleware(req){
  try {
    const auth = req.headers.get('authorization') || ''
    const [scheme, encoded] = auth.split(' ')
    const USER = process.env.BASIC_AUTH_USER || 'equipo'
    const PASS = process.env.BASIC_AUTH_PASS || 'TorreElite2025!'
    if (scheme === 'Basic' && encoded){
      const decoded = b64decode(encoded) // "user:pass"
      const idx = decoded.indexOf(':')
      const user = idx >= 0 ? decoded.slice(0, idx) : ''
      const pass = idx >= 0 ? decoded.slice(idx+1) : ''
      if (user === USER && pass === PASS){
        return NextResponse.next()
      }
    }
    return unauthorized()
  } catch (_e) {
    return unauthorized()
  }
}

// Protect everything except Next internal assets & favicon
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
}
