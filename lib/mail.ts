// E-mail via Resend (https://resend.com)
// TODO: Sæt RESEND_API_KEY i .env.local

interface BookingConfirmationData {
  to: string
  kundeNavn: string
  bookingNr: string
  bilNavn: string
  start: string
  slut: string
  totalPris: number
}

interface ReminderData {
  to: string
  kundeNavn: string
  bookingNr: string
  bilNavn: string
  start: string
  adresse: string
}

async function sendMail(to: string, subject: string, html: string) {
  if (!process.env.RESEND_API_KEY) {
    console.log(`[Mail MOCK] Til: ${to}\nEmne: ${subject}\n---\n${html.replace(/<[^>]+>/g, '')}\n---`)
    return { id: 'mock-' + Date.now() }
  }

  const { Resend } = await import('resend')
  const resend = new Resend(process.env.RESEND_API_KEY)

  const { data, error } = await resend.emails.send({
    from: process.env.EMAIL_FROM ?? 'Lejebilen.nu <booking@lejebilen.nu>',
    to,
    subject,
    html,
  })

  if (error) throw new Error(`Mail fejlede: ${error.message}`)
  return data
}

export async function sendBookingConfirmation(d: BookingConfirmationData) {
  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
      <h2 style="color:#1a2d4f">Tak for din booking, ${d.kundeNavn}!</h2>
      <p>Din booking er bekræftet. Her er dine detaljer:</p>
      <table style="width:100%;border-collapse:collapse;margin:20px 0">
        <tr><td style="padding:8px 0;color:#666">Booking nr.</td><td style="font-weight:bold">${d.bookingNr}</td></tr>
        <tr><td style="padding:8px 0;color:#666">Bil</td><td>${d.bilNavn}</td></tr>
        <tr><td style="padding:8px 0;color:#666">Afhentning</td><td>${d.start}</td></tr>
        <tr><td style="padding:8px 0;color:#666">Aflevering</td><td>${d.slut}</td></tr>
        <tr><td style="padding:8px 0;color:#666">I alt</td><td style="font-weight:bold">${d.totalPris.toLocaleString('da-DK')} kr.</td></tr>
      </table>
      <p style="color:#666;font-size:14px">Husk at medbringe gyldigt kørekort ved afhentning hos Ølstykke Auto, Stationsvej 12, 3650 Ølstykke.</p>
      <p style="color:#666;font-size:14px">Spørgsmål? Ring til os på 47 12 34 56.</p>
    </div>
  `
  return sendMail(d.to, `Booking bekræftet — ${d.bookingNr}`, html)
}

export async function sendReminder(d: ReminderData) {
  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
      <h2 style="color:#1a2d4f">Påmindelse: Afhentning i morgen</h2>
      <p>Hej ${d.kundeNavn},</p>
      <p>Husk at hente din ${d.bilNavn} i morgen <strong>${d.start}</strong>.</p>
      <p>Adresse: ${d.adresse}</p>
      <p style="color:#666;font-size:14px">Booking nr.: ${d.bookingNr} · Ring 47 12 34 56 ved spørgsmål.</p>
    </div>
  `
  return sendMail(d.to, `Påmindelse: Afhentning af ${d.bilNavn} i morgen`, html)
}

export async function sendCancellation(to: string, kundeNavn: string, bookingNr: string) {
  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
      <h2 style="color:#1a2d4f">Din booking er annulleret</h2>
      <p>Hej ${kundeNavn}, din booking ${bookingNr} er annulleret.</p>
      <p style="color:#666;font-size:14px">Eventuel betaling refunderes inden for 5 hverdage. Ring 47 12 34 56 ved spørgsmål.</p>
    </div>
  `
  return sendMail(to, `Booking annulleret — ${bookingNr}`, html)
}
