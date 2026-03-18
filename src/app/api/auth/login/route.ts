import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const { username, password } = await request.json()

  const validUser = process.env.BASIC_AUTH_USER || 'admin'
  const validPassword = process.env.BASIC_AUTH_PASSWORD || 'captable2024'

  if (username === validUser && password === validPassword) {
    const response = NextResponse.json({ success: true })
    response.cookies.set('cap-table-auth', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })
    return response
  }

  return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 })
}
