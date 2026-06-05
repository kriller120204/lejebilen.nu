// e-conomic integration (https://www.e-conomic.com/developer)
// TODO: Sæt ECONOMIC_SECRET_TOKEN + ECONOMIC_AGREEMENT_GRANT_TOKEN i .env.local

const BASE = 'https://restapi.e-conomic.com'

function headers() {
  return {
    'X-AppSecretToken': process.env.ECONOMIC_SECRET_TOKEN ?? '',
    'X-AgreementGrantToken': process.env.ECONOMIC_AGREEMENT_GRANT_TOKEN ?? '',
    'Content-Type': 'application/json',
  }
}

export interface EconomicInvoice {
  draftInvoiceNumber?: number
  bookedInvoiceNumber?: number
}

export async function createDraftInvoice(data: {
  bookingNr: string
  kundeNavn: string
  kundeEmail: string
  linjer: Array<{ beskrivelse: string; antal: number; pris: number }>
}): Promise<EconomicInvoice> {
  if (!process.env.ECONOMIC_SECRET_TOKEN) {
    console.warn('[e-conomic MOCK] createDraftInvoice', data.bookingNr)
    return { draftInvoiceNumber: Math.floor(Math.random() * 10000) }
  }

  // TODO: Slå kundenr. op (eller opret debitor) og brug korrekt kontokode/layout
  const total = data.linjer.reduce((s, l) => s + l.antal * l.pris, 0)

  const body = {
    date: new Date().toISOString().slice(0, 10),
    currency: 'DKK',
    paymentTerms: { paymentTermsNumber: 1 },
    customer: { customerNumber: 1 },
    recipient: { name: data.kundeNavn, address: data.kundeEmail },
    notes: { heading: `Lejeaftale ${data.bookingNr}` },
    lines: data.linjer.map((l, i) => ({
      lineNumber: i + 1,
      description: l.beskrivelse,
      quantity: l.antal,
      unitNetPrice: l.pris,
      discountPercentage: 0,
      unit: { unitNumber: 1 },
      product: { productNumber: '1' },
    })),
  }

  const res = await fetch(`${BASE}/invoices/drafts`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`e-conomic createDraftInvoice fejlede: ${res.status}`)
  return res.json()
}

export async function bookInvoice(draftNumber: number): Promise<EconomicInvoice> {
  if (!process.env.ECONOMIC_SECRET_TOKEN) {
    console.warn('[e-conomic MOCK] bookInvoice', draftNumber)
    return { bookedInvoiceNumber: draftNumber }
  }

  const res = await fetch(`${BASE}/invoices/booked`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ draftInvoice: { draftInvoiceNumber: draftNumber } }),
  })
  if (!res.ok) throw new Error(`e-conomic bookInvoice fejlede: ${res.status}`)
  return res.json()
}
