import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { genBookingNr } from '@/lib/utils'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const Schema = z.object({
  customer_id: z.string().optional(),
  ny_kunde: z.object({
    navn: z.string().min(1),
    email: z.string().email(),
    telefon: z.string().min(1),
    adresse: z.string().optional(),
  }).optional(),
  car_id: z.string(),
  start: z.string(),
  slut: z.string(),
  total_pris: z.number().positive(),
  noter: z.string().optional(),
  betalingsstatus: z.enum(['AFVENTER', 'BETALT']).default('AFVENTER'),
  gentag_uger: z.number().int().min(0).max(52).default(0),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = Schema.parse(body)

    // Resolver kunde
    let customer_id = data.customer_id
    if (!customer_id && data.ny_kunde) {
      const k = await db.customer.upsert({
        where: { email: data.ny_kunde.email },
        update: { telefon: data.ny_kunde.telefon },
        create: {
          navn: data.ny_kunde.navn,
          email: data.ny_kunde.email,
          telefon: data.ny_kunde.telefon,
          adresse: data.ny_kunde.adresse,
        },
      })
      customer_id = k.id
    }
    if (!customer_id) {
      return NextResponse.json({ error: 'Mangler kunde' }, { status: 400 })
    }

    const start = new Date(data.start)
    const slut = new Date(data.slut)
    const diffMs = slut.getTime() - start.getTime()
    const uger = 1 + (data.gentag_uger ?? 0)

    const bookings = Array.from({ length: uger }, (_, i) => ({
      booking_nr: genBookingNr(),
      car_id: data.car_id,
      customer_id,
      start: new Date(start.getTime() + i * 7 * 24 * 60 * 60 * 1000),
      slut: new Date(start.getTime() + i * 7 * 24 * 60 * 60 * 1000 + diffMs),
      total_pris: data.total_pris,
      status: 'BEKRAEFTET' as const,
      betalingsstatus: data.betalingsstatus as 'AFVENTER' | 'BETALT',
      noter: data.noter ?? null,
    }))

    const created = await db.$transaction(
      bookings.map(b => db.booking.create({ data: b }))
    )

    return NextResponse.json({ oprettet: created.length, bookinger: created }, { status: 201 })
  } catch (e) {
    if (e instanceof z.ZodError) return NextResponse.json(e.errors, { status: 400 })
    console.error('admin/bookings POST:', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
