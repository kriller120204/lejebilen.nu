import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const includeBookings = req.nextUrl.searchParams.get('include') === 'bookings'

  const customers = await db.customer.findMany({
    orderBy: { oprettet: 'desc' },
    include: {
      _count: { select: { bookings: true } },
      ...(includeBookings ? {
        bookings: {
          orderBy: { oprettet: 'desc' },
          take: 10,
          select: {
            id: true,
            booking_nr: true,
            start: true,
            slut: true,
            total_pris: true,
            car: { select: { navn: true } },
          },
        },
      } : {}),
    },
  })
  return NextResponse.json(customers)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const customer = await db.customer.create({ data: body })
    return NextResponse.json(customer, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Create failed' }, { status: 400 })
  }
}
