// SMS via 46elks (https://46elks.com)
// TODO: Sæt FORTYSIX_ELKS_USERNAME + FORTYSIX_ELKS_PASSWORD i .env.local

async function sendSms(to: string, message: string) {
  const username = process.env.FORTYSIX_ELKS_USERNAME
  const password = process.env.FORTYSIX_ELKS_PASSWORD

  if (!username || !password) {
    console.log(`[SMS MOCK] Til: ${to}\nBesked: ${message}`)
    return { id: 'mock-sms-' + Date.now() }
  }

  const params = new URLSearchParams({
    from: process.env.SMS_FROM ?? 'Lejebilen',
    to,
    message,
  })

  const res = await fetch('https://api.46elks.com/a1/sms', {
    method: 'POST',
    headers: {
      Authorization: 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  })

  if (!res.ok) throw new Error(`SMS fejlede: ${res.status}`)
  return res.json()
}

export async function sendBookingSms(telefon: string, kundeNavn: string, bookingNr: string, start: string) {
  const msg = `Hej ${kundeNavn}! Din booking ${bookingNr} er bekræftet. Afhent bilen ${start} hos Ølstykke Auto, Stationsvej 12. Spørgsmål: 47 12 34 56`
  return sendSms(telefon, msg)
}

export async function sendReminderSms(telefon: string, kundeNavn: string, bilNavn: string, start: string) {
  const msg = `Hej ${kundeNavn}! Påmindelse: Din ${bilNavn} kan hentes ${start} hos Ølstykke Auto. Husk kørekort. Tlf: 47 12 34 56`
  return sendSms(telefon, msg)
}
