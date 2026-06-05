import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const fra = req.nextUrl.searchParams.get('fra')
  const til = req.nextUrl.searchParams.get('til')

  if (!fra || !til) return NextResponse.json({ error: 'fra and til required' }, { status: 400 })

  const start = new Date(fra)
  const slut = new Date(til)

  // Cars that have overlapping bookings in the period
  const bookedCarIds = await db.booking.findMany({
    where: {
      status: { notIn: ['ANNULLERET'] },
      start: { lt: slut },
      slut: { gt: start },
    },
    select: { car_id: true },
    distinct: ['car_id'],
  })

  const excludeIds = bookedCarIds.map(b => b.car_id)

  const cars = await db.car.findMany({
    where: {
      status: 'LEDIG',
      id: excludeIds.length > 0 ? { notIn: excludeIds } : undefined,
    },
    orderBy: { pris_dag: 'asc' },
    include: { images: { take: 1 } },
  })

  return NextResponse.json(cars)
}
