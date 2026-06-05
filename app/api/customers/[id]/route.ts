export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

interface Ctx { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { id } = await params
  const customer = await db.customer.findUnique({
    where: { id },
    include: {
      bookings: {
        orderBy: { oprettet: 'desc' },
        include: { car: { select: { navn: true } } },
      },
    },
  })
  if (!customer) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(customer)
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  const { id } = await params
  try {
    const body = await req.json()
    const customer = await db.customer.update({ where: { id }, data: body })
    return NextResponse.json(customer)
  } catch {
    return NextResponse.json({ error: 'Update failed' }, { status: 400 })
  }
}
