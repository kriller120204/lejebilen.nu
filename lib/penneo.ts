// Penneo digital underskrift (https://penneo.com)
// TODO: Sæt PENNEO_CLIENT_ID + PENNEO_CLIENT_SECRET i .env.local
// Docs: https://developer.penneo.com/

export interface PenneoSignRequest {
  id: string
  status: 'pending' | 'signed' | 'rejected'
  signingUrl: string
  documentUrl?: string
}

export async function createSignRequest(
  bookingNr: string,
  signerName: string,
  signerEmail: string,
  pdfBase64: string,
): Promise<PenneoSignRequest> {
  // TODO: Implementér Penneo OAuth2 + case/document/signer oprettelse
  if (!process.env.PENNEO_CLIENT_ID) {
    console.warn('[Penneo MOCK] createSignRequest', bookingNr, signerEmail)
    return {
      id: 'penneo-mock-' + Date.now(),
      status: 'pending',
      signingUrl: `${process.env.NEXT_PUBLIC_URL}/booking/sign-mock?booking=${bookingNr}`,
    }
  }

  throw new Error('Penneo integration ikke implementeret endnu — sæt PENNEO_CLIENT_ID')
}

export async function getSignRequestStatus(penneoId: string): Promise<PenneoSignRequest> {
  // TODO: Poll Penneo for signaturstatus
  console.warn('[Penneo MOCK] getStatus', penneoId)
  return { id: penneoId, status: 'signed', signingUrl: '' }
}

export function generateContractHtml(data: {
  bookingNr: string
  udlejer: string
  lejerNavn: string
  lejerAdresse: string
  bilNavn: string
  regNr: string
  start: string
  slut: string
  dage: number
  prisDag: number
  totalPris: number
  depositum: number
}): string {
  return `
    <html><body style="font-family:sans-serif;max-width:700px;margin:0 auto;padding:40px">
      <h1 style="font-size:22px">Lejekontrakt — ${data.udlejer}</h1>
      <p><strong>Booking nr.:</strong> ${data.bookingNr}</p>
      <hr/>
      <p><strong>Udlejer:</strong> ${data.udlejer}, Stationsvej 12, 3650 Ølstykke · CVR 12345678</p>
      <p><strong>Lejer:</strong> ${data.lejerNavn}, ${data.lejerAdresse}</p>
      <p><strong>Køretøj:</strong> ${data.bilNavn} · Reg.nr. ${data.regNr}</p>
      <p><strong>Afhentning:</strong> ${data.start}</p>
      <p><strong>Aflevering:</strong> ${data.slut} (${data.dage} dage)</p>
      <p><strong>Pris:</strong> ${data.prisDag} kr./dag × ${data.dage} dage = ${data.totalPris} kr. inkl. forsikring</p>
      <p><strong>Depositum:</strong> ${data.depositum} kr. (reserveres — frigives ved aflevering)</p>
      <hr/>
      <h3>Vilkår</h3>
      <ol style="font-size:13px;line-height:1.8">
        <li>Lejer forpligter sig til at føre køretøjet forsvarligt og i overensstemmelse med færdselsloven.</li>
        <li>Bilen afleveres i samme stand og med samme brændstofniveau som ved afhentning.</li>
        <li>Bilen må ikke føres uden for EU/EØS uden forudgående skriftlig aftale.</li>
        <li>Skader skal anmeldes straks. Selvrisiko: 3.000 kr. (kan reduceres ved tilvalg).</li>
        <li>300 frikm pr. dag — ekstra km faktureres à 1,50 kr./km.</li>
        <li>Rygning i bilen udløser et rengøringsgebyr på minimum 1.500 kr.</li>
        <li>Gratis afbestilling frem til 24 timer før afhentning. Derefter opkræves 50% af lejeprisen.</li>
        <li>Udlejer forbeholder sig ret til at tilbageholde depositum ved skader, manglende brændstof eller forsinket aflevering.</li>
      </ol>
      <p style="margin-top:40px">Dato: _______________  &nbsp;&nbsp;  Underskrift lejer: _______________</p>
    </body></html>
  `
}
