import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)

  const [
    totalBookings,
    activeBookings,
    monthRevenue,
    lastMonthRevenue,
    totalCars,
    availableCars,
    topCars,
  ] = await Promise.all([
    db.booking.count({ where: { status: { not: 'ANNULLERET' } } }),
    db.booking.count({ where: { status: { in: ['AKTIV', 'UDLEJET', 'BEKRAEFTET'] } } }),
    db.booking.aggregate({
      _sum: { total_pris: true },
      where: { oprettet: { gte: monthStart }, status: { not: 'ANNULLERET' } },
    }),
    db.booking.aggregate({
      _sum: { total_pris: true },
      where: { oprettet: { gte: lastMonthStart, lt: monthStart }, status: { not: 'ANNULLERET' } },
    }),
    db.car.count({ where: { status: { not: 'UDGAAET' } } }),
    db.car.count({ where: { status: 'LEDIG' } }),
    db.booking.groupBy({
      by: ['car_id'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 5,
      where: { status: { not: 'ANNULLERET' } },
    }),
  ])

  return NextResponse.json({
    totalBookings,
    activeBookings,
    monthRevenue: monthRevenue._sum.total_pris ?? 0,
    lastMonthRevenue: lastMonthRevenue._sum.total_pris ?? 0,
    totalCars,
    availableCars,
    udnyttelse: totalCars > 0 ? Math.round(((totalCars - availableCars) / totalCars) * 100) : 0,
    topCars,
  })
}
