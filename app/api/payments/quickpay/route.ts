import { NextRequest, NextResponse } from 'next/server'
import { createPayment, createPaymentLink } from '@/lib/quickpay'
import { db } from '@/lib/db'
import { z } from 'zod'

const Schema = z.object({
  booking_id: z.string(),
  payment_method: z.enum(['MOBILEPAY', 'KORT']).default('MOBILEPAY'),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { booking_id, payment_method } = Schema.parse(body)

    const booking = await db.booking.findUnique({
      where: { id: booking_id },
      include: { car: true },
    })
    if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })

    const qpPayment = await createPayment(booking.booking_nr, 'DKK')

    const linkUrl = await createPaymentLink(
      qpPayment.id,
      Math.round(booking.total_pris * 100),
      `${process.env.NEXT_PUBLIC_URL}/api/payments/quickpay/callback`,
      `${process.env.NEXT_PUBLIC_URL}/booking/${booking.car_id}/bekraeftet?booking=${booking.booking_nr}`,
      `${process.env.NEXT_PUBLIC_URL}/booking/${booking.car_id}`,
    )

    await db.payment.create({
      data: {
        booking_id,
        metode: payment_method,
        beloeb: booking.total_pris,
        status: 'AFVENTER',
        quickpay_id: String(qpPayment.id),
      },
    })

    return NextResponse.json({ payment_url: linkUrl })
  } catch (e) {
    if (e instanceof z.ZodError) return NextResponse.json(e.errors, { status: 400 })
    console.error(e)
    return NextResponse.json({ error: 'Payment initiation failed' }, { status: 500 })
  }
}
