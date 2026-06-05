export function fmt(n: number) {
  return n.toLocaleString('da-DK') + ' kr.'
}

export function fmtDate(d: Date | string) {
  return new Date(d).toLocaleDateString('da-DK', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function fmtDateShort(d: Date | string) {
  return new Date(d).toLocaleDateString('da-DK', { day: 'numeric', month: 'short' })
}

export function fmtDateTime(d: Date | string) {
  return new Date(d).toLocaleString('da-DK', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export function daysBetween(a: Date | string, b: Date | string) {
  const ms = new Date(b).getTime() - new Date(a).getTime()
  return Math.max(1, Math.round(ms / 86_400_000))
}

export function genBookingNr() {
  const year = new Date().getFullYear()
  const seq = Math.floor(Math.random() * 9000) + 1000
  return `LB-${year}-${seq}`
}

export function initials(navn: string) {
  return navn.split(' ').map(x => x[0]).slice(0, 2).join('').toUpperCase()
}

export function kategoriLabel(k: string) {
  const map: Record<string, string> = {
    LILLE: 'Lille bil', MELLEMKLASSE: 'Mellemklasse', STATIONCAR: 'Stationcar',
    EL: 'El', VAREBIL: 'Varebil',
  }
  return map[k] ?? k
}

export function gearLabel(g: string) {
  return g === 'AUTOMATIK' ? 'Automatik' : 'Manuel'
}

export function braendstofLabel(b: string) {
  const map: Record<string, string> = { BENZIN: 'Benzin', DIESEL: 'Diesel', EL: 'El', HYBRID: 'Hybrid' }
  return map[b] ?? b
}

export function statusLabel(s: string) {
  const map: Record<string, string> = {
    LEDIG: 'Ledig', RESERVERET: 'Reserveret', UDLEJET: 'Udlejet', SERVICE: 'Service',
    BEKRAEFTET: 'Bekræftet', AFSLUTTET: 'Afsluttet', ANNULLERET: 'Annulleret',
    BETALT: 'Betalt', AFVENTER: 'Afventer', REFUNDERET: 'Refunderet',
  }
  return map[s] ?? s
}

export function statusClass(s: string) {
  if (['LEDIG', 'BETALT', 'AFSLUTTET'].includes(s)) return 'green'
  if (['RESERVERET', 'BEKRAEFTET', 'AFVENTER'].includes(s)) return 'amber'
  if (['UDLEJET'].includes(s)) return 'red'
  if (['ANNULLERET', 'REFUNDERET'].includes(s)) return 'red'
  return 'blue'
}
