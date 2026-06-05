import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  const { password } = await req.json()
  const correct = process.env.ADMIN_PASSWORD

  if (!correct || password !== correct) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const jar = await cookies()
  jar.set('admin_session', process.env.ADMIN_SECRET ?? 'dev-secret', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: '/',
  })

  return NextResponse.json({ ok: true })
}

export async function DELETE() {
  const jar = await cookies()
  jar.delete('admin_session')
  return NextResponse.json({ ok: true })
}
