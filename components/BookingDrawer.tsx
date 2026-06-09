'use client'
import { fmt, fmtDateTime, statusLabel, statusClass } from '@/lib/utils'

interface Booking {
  id: string
  booking_nr: string
  status: string
  total_pris: number
  betalingsstatus: string
  start: string
  slut: string
  car: { navn: string; reg_nr: string }
  customer: { navn: string; telefon: string; email: string; koerekort_verificeret: boolean }
  payments?: Array<{ metode: string; status: string }>
  contract?: { pdf_url?: string | null; signeret_af?: string | null } | null
}

interface Props {
  booking: Booking | null
  onClose: () => void
  onUpdate?: () => void
}

export default function BookingDrawer({ booking, onClose, onUpdate }: Props) {
  async function handleCancel() {
    if (!booking) return
    if (!confirm(`Annullér booking ${booking.booking_nr}?`)) return
    await fetch(`/api/bookings/${booking.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'ANNULLERET' }),
    })
    onClose()
    onUpdate?.()
  }

  const PaymentMethod: Record<string, string> = { MOBILEPAY: 'MobilePay', KORT: 'Kort', KONTANT: 'Kontant' }

  return (
    <>
      <div className={`drawer-back ${booking ? 'open' : ''}`} onClick={onClose} />
      <aside className={`drawer ${booking ? 'open' : ''}`}>
        {booking && (
          <>
            <div className="dr-head">
              <div>
                <div className="muted mono" style={{ fontSize: 13 }}>{booking.booking_nr}</div>
                <h2 style={{ fontSize: 22, marginTop: 4 }}>{booking.customer.navn}</h2>
                <span className={`badge ${statusClass(booking.status)}`} style={{ marginTop: 8, display: 'inline-flex' }}>
                  {statusLabel(booking.status)}
                </span>
              </div>
              <button type="button" className="close-x" onClick={onClose}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <div className="dr-body">
              <div className="dr-sec">
                <h4>Lejedetaljer</h4>
                <div className="dr-kv"><span className="k">Bil</span><span className="v">{booking.car.navn} · {booking.car.reg_nr}</span></div>
                <div className="dr-kv"><span className="k">Afhentning</span><span className="v">{fmtDateTime(booking.start)}</span></div>
                <div className="dr-kv"><span className="k">Aflevering</span><span className="v">{fmtDateTime(booking.slut)}</span></div>
                <div className="dr-kv"><span className="k">Pris i alt</span><span className="v">{fmt(booking.total_pris)}</span></div>
                <div className="dr-kv">
                  <span className="k">Betaling</span>
                  <span className="v">
                    <span className={`badge ${statusClass(booking.betalingsstatus)}`}>
                      {statusLabel(booking.betalingsstatus)}
                      {booking.payments?.[0] && ` · ${PaymentMethod[booking.payments[0].metode] ?? booking.payments[0].metode}`}
                    </span>
                  </span>
                </div>
              </div>

              <div className="dr-sec">
                <h4>Kunde</h4>
                <div className="dr-kv"><span className="k">Telefon</span><span className="v">{booking.customer.telefon}</span></div>
                <div className="dr-kv"><span className="k">Email</span><span className="v">{booking.customer.email}</span></div>
                <div className="dr-kv">
                  <span className="k">Kørekort</span>
                  <span className="v">
                    <span className={`badge ${booking.customer.koerekort_verificeret ? 'green' : 'amber'}`}>
                      {booking.customer.koerekort_verificeret ? 'Verificeret' : 'Ikke verificeret'}
                    </span>
                  </span>
                </div>
              </div>

              <div className="dr-sec">
                <h4>Dokumenter</h4>
                {booking.contract?.pdf_url ? (
                  <a href={booking.contract.pdf_url} target="_blank" rel="noreferrer" className="doc-item">
                    <span className="di">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>
                    </span>
                    <div>
                      <div className="dt">Lejekontrakt.pdf</div>
                      <div className="dd">{booking.contract.signeret_af ? `Underskrevet · ${booking.contract.signeret_af}` : 'Afventer underskrift'}</div>
                    </div>
                    <span className="dl">↓</span>
                  </a>
                ) : (
                  <p style={{ fontSize: 13, color: 'var(--muted)' }}>Ingen kontrakt endnu</p>
                )}
              </div>

              <div className="row gap-12">
                <button className="btn block">Rediger booking</button>
                <button
                  className="btn ghost"
                  onClick={handleCancel}
                  style={{ color: 'var(--red)', borderColor: 'var(--red-bg)' }}
                >
                  Annullér
                </button>
              </div>
            </div>
          </>
        )}
      </aside>
    </>
  )
}
