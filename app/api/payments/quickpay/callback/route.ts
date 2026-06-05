import { NextRequest, NextResponse } from 'next/server'
import { verifyChecksum } from '@/lib/quickpay'
import { db } from '@/lib/db'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('quickpay-checksum-sha256') ?? ''

  if (!verifyChecksum(body, signature)) {
    return NextResponse.json({ error: 'Invalid checksum' }, { status: 401 })
  }

  try {
    const payload = JSON.parse(body)
    const orderId: string = payload.order_id
    const accepted: boolean = payload.accepted
    const state: string = payload.state

    const booking = await db.booking.findFirst({
      where: { booking_nr: orderId },
    })

    if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })

    // BetalingStatus enum: AFVENTER | BETALT | DELVIST | REFUNDERET
    const betalingsstatus = accepted && state === 'processed' ? 'BETALT' : 'AFVENTER'
    // PaymentStatus enum: AFVENTER | BETALT | FEJL | REFUNDERET
    const paymentStatus = accepted && state === 'processed' ? 'BETALT'
      : state === 'rejected' ? 'FEJL'
      : 'AFVENTER'

    await db.booking.update({
      where: { id: booking.id },
      data: {
        betalingsstatus: betalingsstatus as 'BETALT' | 'AFVENTER',
        status: accepted ? 'BEKRAEFTET' : booking.status,
      },
    })

    await db.payment.updateMany({
      where: { booking_id: booking.id, quickpay_id: String(payload.id) },
      data: {
        status: paymentStatus as 'BETALT' | 'FEJL' | 'AFVENTER',
        transaktion_id: payload.id ? String(payload.id) : undefined,
      },
    })

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('QuickPay callback error:', e)
    return NextResponse.json({ error: 'Callback processing failed' }, { status: 500 })
  }
}
