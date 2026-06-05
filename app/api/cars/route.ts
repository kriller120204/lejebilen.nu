import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const CarSchema = z.object({
  navn: z.string().min(1),
  reg_nr: z.string().min(1),
  kategori: z.enum(['LILLE', 'MELLEMKLASSE', 'STATIONCAR', 'EL', 'VAREBIL']),
  gear: z.enum(['MANUEL', 'AUTOMATIK']),
  braendstof: z.enum(['BENZIN', 'DIESEL', 'HYBRID', 'EL']),
  saeder: z.number().int().min(1).max(9),
  pris_dag: z.number().positive(),
  depositum: z.number().nonnegative(),
  km_per_dag: z.number().positive(),
  status: z.enum(['LEDIG', 'UDLEJET', 'SERVICE', 'UDGAAET']).default('LEDIG'),
  beskrivelse: z.string().nullable().optional(),
})

export async function GET(req: NextRequest) {
  const showAll = req.nextUrl.searchParams.get('all') === '1'
  const cars = await db.car.findMany({
    where: showAll ? undefined : { status: { not: 'UDGAAET' } },
    orderBy: { pris_dag: 'asc' },
    include: { images: { take: 1 } },
  })
  return NextResponse.json(cars)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = CarSchema.parse(body)
    const car = await db.car.create({ data })
    return NextResponse.json(car, { status: 201 })
  } catch (e) {
    if (e instanceof z.ZodError) return NextResponse.json(e.errors, { status: 400 })
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
