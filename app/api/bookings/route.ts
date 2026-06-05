import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'
import { genBookingNr } from '@/lib/utils'
import { createPayment, createPaymentLink } from '@/lib/quickpay'
import { sendBookingConfirmation } from '@/lib/mail'
import { sendBookingSms } from '@/lib/sms'
import { z } from 'zod'

const CustomerSchema = z.object({
  navn: z.string().min(1),
  email: z.string().email(),
  telefon: z.string().min(1),
  adresse: z.string().optional(),
  postnr: z.string().optional(),
  by: z.string().optional(),
})

const BookingSchema = z.object({
  car_id: z.string(),
  start: z.string(),
  slut: z.string(),
  customer: CustomerSchema,
  extras: z.array(z.object({
    type: z.string(),
    pris: z.number(),
  })).optional(),
  total_pris: z.number().positive(),
  payment_method: z.enum(['MOBILEPAY', 'KORT', 'KONTANT']).default('MOBILEPAY'),
})

export async function GET(req: NextRequest) {
  const includeAll = req.nextUrl.searchParams.get('include') === 'all'

  const bookings = await db.booking.findMany({
    orderBy: { oprettet: 'desc' },
    include: {
      car: { select: { id: true, navn: true, reg_nr: true } },
      customer: { select: { id: true, navn: true, telefon: true, email: true, koerekort_verificeret: true } },
      ...(includeAll ? {
        payments: { select: { metode: true, status: true } },
        contract: { select: { pdf_url: true, signeret_af: true } },
      } : {}),
    },
  })
  return NextResponse.json(bookings)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = BookingSchema.parse(body)

    // Upsert customer
    const customer = await db.customer.upsert({
      where: { email: data.customer.email },
      update: { telefon: data.customer.telefon },
      create: {
        navn: data.customer.navn,
        email: data.customer.email,
        telefon: data.customer.telefon,
        adresse: data.customer.adresse,
        postnr: data.customer.postnr,
        by: data.customer.by,
      },
    })

    const booking_nr = genBookingNr()

    const booking = await db.booking.create({
      data: {
        booking_nr,
        car_id: data.car_id,
        customer_id: customer.id,
        start: new Date(data.start),
        slut: new Date(data.slut),
        total_pris: data.total_pris,
        status: 'AFVENTER',
        betalingsstatus: 'AFVENTER',
        extras: data.extras?.length
          ? {
              create: data.extras.map(e => ({
                type: e.type as 'CHAUFFOR' | 'BARNESTOL' | 'SELVRISIKO' | 'GPS',
                pris: e.pris,
              })),
            }
          : undefined,
      },
      include: { car: true, customer: true },
    })

    // Create QuickPay payment + link
    let payment_url: string | null = null
    try {
      const qpPayment = await createPayment(booking_nr, 'DKK')
      if (qpPayment?.id) {
        const linkUrl = await createPaymentLink(
          qpPayment.id,
          Math.round(data.total_pris * 100),
          `${process.env.NEXT_PUBLIC_URL}/api/payments/quickpay/callback`,
          `${process.env.NEXT_PUBLIC_URL}/booking/${data.car_id}/bekraeftet?booking=${booking_nr}`,
          `${process.env.NEXT_PUBLIC_URL}/booking/${data.car_id}`,
        )
        payment_url = linkUrl ?? null

        await db.payment.create({
          data: {
            booking_id: booking.id,
            metode: data.payment_method,
            beloeb: data.total_pris,
            status: 'AFVENTER',
            quickpay_id: String(qpPayment.id),
          },
        })
      }
    } catch (e) {
      console.error('QuickPay error (non-fatal):', e)
    }

    // Notifications (non-fatal)
    try {
      await sendBookingConfirmation({
        to: customer.email,
        kundeNavn: customer.navn,
        bookingNr: booking_nr,
        bilNavn: booking.car.navn,
        start: data.start,
        slut: data.slut,
        totalPris: data.total_pris,
      })
      await sendBookingSms(customer.telefon, customer.navn, booking_nr, data.start)
    } catch (e) {
      console.error('Notification error (non-fatal):', e)
    }

    return NextResponse.json({
      id: booking.id,
      booking_nr: booking.booking_nr,
      payment_url,
    }, { status: 201 })
  } catch (e) {
    if (e instanceof z.ZodError) return NextResponse.json(e.errors, { status: 400 })
    console.error(e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
