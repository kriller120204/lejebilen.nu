'use client'
import { fmt, fmtDateShort, initials } from '@/lib/utils'

interface Booking {
  id: string
  booking_nr: string
  start: string
  slut: string
  total_pris: number
  car: { navn: string }
}

interface Customer {
  id: string
  navn: string
  email: string
  telefon: string
  adresse?: string | null
  postnr?: string | null
  by?: string | null
  koerekort_verificeret: boolean
  oprettet: string
  bookings?: Booking[]
}

interface Props {
  customer: Customer | null
  onClose: () => void
}

const HUES = [256, 155, 25, 78, 300, 200, 120, 350, 30, 180]

function hueForNavn(navn: string) {
  let h = 0
  for (const c of navn) h = (h * 31 + c.charCodeAt(0)) % HUES.length
  return HUES[h]
}

export default function CustomerDrawer({ customer, onClose }: Props) {
  const open = customer !== null
  if (!customer) return (
    <>
      <div className={`drawer-back ${open ? 'open' : ''}`} onClick={onClose} />
      <aside className={`drawer ${open ? 'open' : ''}`} />
    </>
  )

  const hue = hueForNavn(customer.navn)
  const bookings = customer.bookings ?? []
  const totalSpent = bookings.reduce((s, b) => s + b.total_pris, 0)

  return (
    <>
      <div className="drawer-back open" onClick={onClose} />
      <aside className="drawer open" style={{ width: 460 }}>
        <div className="dr-head">
          <div className="row gap-12 center">
            <div
              className="cust-av"
              style={{ width: 48, height: 48, fontSize: 17, background: `oklch(0.6 0.13 ${hue})` }}
            >
              {initials(customer.navn)}
            </div>
            <div>
              <h2 style={{ fontSize: 20 }}>{customer.navn}</h2>
              <div className="muted" style={{ fontSize: 13 }}>
                Kunde siden {new Date(customer.oprettet).toLocaleDateString('da-DK', { month: 'long', year: 'numeric' })}
              </div>
            </div>
          </div>
          <button className="close-x" onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <div className="dr-body">
          <div className="stat-3">
            <div className="s"><div className="sv tnum">{bookings.length}</div><div className="sl">Lejemål</div></div>
            <div className="s"><div className="sv tnum">{totalSpent.toLocaleString('da-DK')}</div><div className="sl">kr. i alt</div></div>
            <div className="s"><div className="sv">★ 5,0</div><div className="sl">Vurdering</div></div>
          </div>

          <div className="dr-sec">
            <h4>Kontakt</h4>
            <div className="dr-kv"><span className="k">Telefon</span><span className="v">{customer.telefon}</span></div>
            <div className="dr-kv"><span className="k">Email</span><span className="v">{customer.email}</span></div>
            {customer.adresse && (
              <div className="dr-kv">
                <span className="k">Adresse</span>
                <span className="v">{customer.adresse}, {customer.postnr} {customer.by}</span>
              </div>
            )}
            <div className="dr-kv">
              <span className="k">Kørekort</span>
              <span className="v">
                <span className={`badge ${customer.koerekort_verificeret ? 'green' : 'amber'}`}>
                  {customer.koerekort_verificeret ? 'Verificeret' : 'Ikke verificeret'}
                </span>
              </span>
            </div>
          </div>

          <div className="dr-sec">
            <h4>Historik over lejemål</h4>
            {bookings.length === 0 && <p style={{ fontSize: 13, color: 'var(--muted)' }}>Ingen lejemål endnu</p>}
            {bookings.slice(0, 5).map(b => (
              <div key={b.id} className="hist">
                <span className="hi">🚗</span>
                <div>
                  <div className="ht">{b.car.navn}</div>
                  <div className="hd">{fmtDateShort(b.start)}–{fmtDateShort(b.slut)} · {b.booking_nr}</div>
                </div>
                <span className="ha">{fmt(b.total_pris)}</span>
              </div>
            ))}
          </div>

          <div className="row gap-12">
            <button className="btn block">Opret booking</button>
            <button className="btn ghost">Rediger</button>
          </div>
        </div>
      </aside>
    </>
  )
}
