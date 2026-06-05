// QuickPay v10 integration
// Docs: https://learn.quickpay.net/tech-talk/api/services/

const BASE = 'https://api.quickpay.net'

function headers() {
  const key = process.env.QUICKPAY_API_KEY
  if (!key) throw new Error('QUICKPAY_API_KEY mangler i .env.local')
  return {
    'Accept-Version': 'v10',
    Authorization: 'Basic ' + Buffer.from(':' + key).toString('base64'),
    'Content-Type': 'application/json',
  }
}

export interface QpPayment {
  id: number
  order_id: string
  currency: string
  state: string
  link?: { url: string }
}

export async function createPayment(orderRef: string, currency = 'DKK'): Promise<QpPayment> {
  // TODO: Erstat med rigtig QuickPay API-kald når nøgler er sat op
  if (!process.env.QUICKPAY_API_KEY) {
    console.warn('[QuickPay MOCK] createPayment', orderRef)
    return { id: Date.now(), order_id: orderRef, currency, state: 'initial' }
  }

  const res = await fetch(`${BASE}/payments`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ order_id: orderRef, currency }),
  })
  if (!res.ok) throw new Error(`QuickPay createPayment fejlede: ${res.status}`)
  return res.json()
}

export async function createPaymentLink(
  paymentId: number,
  amount: number,
  callbackUrl: string,
  successUrl: string,
  cancelUrl: string,
): Promise<string | null> {
  // TODO: Erstat mock med rigtig implementering
  if (!process.env.QUICKPAY_API_KEY) {
    console.warn('[QuickPay MOCK] createPaymentLink — returnerer null, viser bekræftelse direkte')
    return null
  }

  const res = await fetch(`${BASE}/payments/${paymentId}/link`, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify({
      amount,
      callback_url: callbackUrl,
      success_url: successUrl,
      cancel_url: cancelUrl,
      payment_methods: 'mobilepay,creditcard',
      language: 'da',
    }),
  })
  if (!res.ok) throw new Error(`QuickPay createPaymentLink fejlede: ${res.status}`)
  const data = await res.json()
  return data.url
}

export async function getPayment(paymentId: number): Promise<QpPayment> {
  const res = await fetch(`${BASE}/payments/${paymentId}`, { headers: headers() })
  if (!res.ok) throw new Error(`QuickPay getPayment fejlede: ${res.status}`)
  return res.json()
}

export function verifyChecksum(body: string, checksum: string): boolean {
  // TODO: Verificér QuickPay webhook-signatur med QUICKPAY_PRIVATE_KEY
  // import crypto fra 'crypto'
  // const expected = crypto.createHmac('sha256', process.env.QUICKPAY_PRIVATE_KEY!).update(body).digest('hex')
  // return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(checksum))
  console.warn('[QuickPay MOCK] verifyChecksum — ikke implementeret endnu')
  return true
}
