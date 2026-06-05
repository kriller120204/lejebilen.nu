export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

interface Ctx { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { id } = await params
  const booking = await db.booking.findUnique({
    where: { id },
    include: {
      car: true,
      customer: true,
      extras: true,
      payments: true,
      contract: true,
    },
  })
  if (!booking) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(booking)
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const { id } = await params
  try {
    const body = await req.json()
    const booking = await db.booking.update({
      where: { id },
      data: body,
    })
    return NextResponse.json(booking)
  } catch {
    return NextResponse.json({ error: 'Update failed' }, { status: 400 })
  }
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { id } = await params
  await db.booking.update({ where: { id }, data: { status: 'ANNULLERET' } })
  return NextResponse.json({ ok: true })
}
