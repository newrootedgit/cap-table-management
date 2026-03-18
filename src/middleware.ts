import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const authHeader = request.headers.get('authorization')

  if (authHeader) {
    const [scheme, encoded] = authHeader.split(' ')
    if (scheme === 'Basic' && encoded) {
      const decoded = atob(encoded)
      const [user, password] = decoded.split(':')
      const validUser = process.env.BASIC_AUTH_USER || 'admin'
      const validPassword = process.env.BASIC_AUTH_PASSWORD || 'captable2024'

      if (user === validUser && password === validPassword) {
        return NextResponse.next()
      }
    }
  }

  return new NextResponse('Authentication required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Cap Table Management"',
    },
  })
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
