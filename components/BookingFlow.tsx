'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ImageSlot from './ImageSlot'
import { fmt, daysBetween } from '@/lib/utils'

interface Car {
  id: string
  navn: string
  kategori: string
  reg_nr: string
  pris_dag: number
  depositum: number
  images?: Array<{ url: string }>
}

interface Props {
  car: Car
  defaultFra?: string
  defaultTil?: string
}

interface Extra { id: string; label: string; desc: string; price: number; perDay: boolean; icon: React.ReactNode }
interface CustomerForm {
  fornavn: string; efternavn: string; adresse: string; postnr: string; by: string
  telefon: string; email: string
}

const EXTRAS: Extra[] = [
  { id: 'chauffor', label: 'Ekstra chauffør', desc: 'Tilføj én ekstra fører til kontrakten', price: 60, perDay: false, icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg> },
  { id: 'barnestol', label: 'Barnestol', desc: 'Godkendt autostol, monteres ved afhentning', price: 40, perDay: true, icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 5h6v9H3zM9 9h7l3 5H9z"/><circle cx="7" cy="19" r="2"/><circle cx="16" cy="19" r="2"/></svg> },
  { id: 'selvrisiko', label: 'Selvrisikoreduktion', desc: 'Reducér selvrisiko fra 3.000 til 0 kr.', price: 89, perDay: true, icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l8 3v7c0 5-8 10-8 10S4 17 4 12V5z"/></svg> },
]

const STEP_LABELS = ['Oplysninger', 'Tilvalg', 'Underskrift', 'Betaling', 'Bekræftelse']

function today() { return new Date().toISOString().slice(0, 16) }
function addDays(iso: string, n: number) {
  const d = new Date(iso); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 16)
}

export default function BookingFlow({ car, defaultFra, defaultTil }: Props) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [fra, setFra] = useState(defaultFra ?? today())
  const [til, setTil] = useState(defaultTil ?? addDays(today(), 2))
  const [extras, setExtras] = useState<Set<string>>(new Set(['selvrisiko']))
  const [payMethod, setPayMethod] = useState('MOBILEPAY')
  const [signProvider, setSignProvider] = useState('MitID')
  const [loading, setLoading] = useState(false)
  const [bookingResult, setBookingResult] = useState<{ booking_nr: string; customer_email: string } | null>(null)
  const [form, setForm] = useState<CustomerForm>({
    fornavn: '', efternavn: '', adresse: '', postnr: '', by: '', telefon: '', email: '',
  })

  const dage = Math.max(1, daysBetween(fra, til))
  const basePris = car.pris_dag * dage
  const extrasPris = EXTRAS.reduce((s, e) => extras.has(e.id) ? s + (e.perDay ? e.price * dage : e.price) : s, 0)
  const total = basePris + extrasPris

  function toggleExtra(id: string) {
    setExtras(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  }

  async function handleSubmitBooking() {
    setLoading(true)
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          car_id: car.id,
          start: fra,
          slut: til,
          customer: {
            navn: `${form.fornavn} ${form.efternavn}`.trim(),
            email: form.email,
            telefon: form.telefon,
            adresse: form.adresse,
            postnr: form.postnr,
            by: form.by,
          },
          extras: EXTRAS
            .filter(e => extras.has(e.id))
            .map(e => ({ type: e.id.toUpperCase(), pris: e.perDay ? e.price * dage : e.price })),
          total_pris: total,
          payment_method: payMethod,
        }),
      })
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()

      if (data.payment_url) {
        window.location.href = data.payment_url
        return
      }

      setBookingResult({ booking_nr: data.booking_nr, customer_email: form.email })
      setStep(5)
    } catch (e) {
      alert('Fejl: ' + (e instanceof Error ? e.message : e))
    } finally {
      setLoading(false)
    }
  }

  const imgSrc = car.images?.[0]?.url ?? null

  return (
    <>
      {/* Header */}
      <header className="book-head">
        <div className="wrap">
          <Link href="/" className="brand">
            <span className="mark"></span>Lejebilen<span style={{ color: 'var(--blue)' }}>.nu</span>
          </Link>
          <span className="secure">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            Sikker booking
          </span>
        </div>
      </header>

      <div className="book-wrap">
        {/* Stepper */}
        <div className="stepper">
          {STEP_LABELS.map((label, i) => {
            const s = i + 1
            const done = s < step
            const active = s === step
            return (
              <div key={s} className={`st ${active ? 'active' : ''} ${done ? 'done' : ''}`}>
                <span className="num">{done ? '✓' : s}</span>
                <span className="lab">{label}</span>
                {s < 5 && <span className="bar" />}
              </div>
            )
          })}
        </div>

        <div className="book-layout">
          <div>
            {/* Step 1 — Oplysninger */}
            {step === 1 && (
              <div className="panel">
                <h2>Dine oplysninger</h2>
                <p className="sub">Vi bruger oplysningerne til lejekontrakten og bekræftelsen.</p>
                <div className="form-grid">
                  <div className="field"><label>Fornavn</label><input className="input" value={form.fornavn} onChange={e => setForm(f => ({...f, fornavn: e.target.value}))} placeholder="Anna" /></div>
                  <div className="field"><label>Efternavn</label><input className="input" value={form.efternavn} onChange={e => setForm(f => ({...f, efternavn: e.target.value}))} placeholder="Sørensen" /></div>
                  <div className="field full"><label>Adresse</label><input className="input" value={form.adresse} onChange={e => setForm(f => ({...f, adresse: e.target.value}))} placeholder="Stationsvej 12" /></div>
                  <div className="field"><label>Postnr.</label><input className="input" value={form.postnr} onChange={e => setForm(f => ({...f, postnr: e.target.value}))} placeholder="3650" /></div>
                  <div className="field"><label>By</label><input className="input" value={form.by} onChange={e => setForm(f => ({...f, by: e.target.value}))} placeholder="Ølstykke" /></div>
                  <div className="field"><label>Telefonnummer</label><input className="input" value={form.telefon} onChange={e => setForm(f => ({...f, telefon: e.target.value}))} placeholder="+45 12 34 56 78" /></div>
                  <div className="field"><label>Email</label><input className="input" type="email" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} placeholder="anna@email.dk" /></div>
                </div>
                <div className="nav-btns">
                  <Link href={`/biler/${car.id}`} className="btn ghost">← Tilbage</Link>
                  <button className="btn" onClick={() => setStep(2)}>Fortsæt →</button>
                </div>
              </div>
            )}

            {/* Step 2 — Tilvalg */}
            {step === 2 && (
              <div className="panel">
                <h2>Lejeperiode & tilvalg</h2>
                <p className="sub">Bekræft din periode og tilføj ekstra, hvis du har brug for det.</p>
                <div className="form-grid" style={{ marginBottom: 24 }}>
                  <div className="field"><label>Afhentning</label><input className="input" type="datetime-local" value={fra} onChange={e => setFra(e.target.value)} /></div>
                  <div className="field"><label>Aflevering</label><input className="input" type="datetime-local" value={til} onChange={e => setTil(e.target.value)} /></div>
                </div>
                <div className="col gap-12">
                  {EXTRAS.map(e => (
                    <div key={e.id} className={`opt ${extras.has(e.id) ? 'sel' : ''}`} onClick={() => toggleExtra(e.id)}>
                      <span className="check">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                      </span>
                      <span className="oic">{e.icon}</span>
                      <span className="otext">
                        <span className="ot">{e.label}</span>
                        <span className="od">{e.desc}</span>
                      </span>
                      <span className="oprice">+{e.price} kr.{e.perDay ? '/dag' : ''}</span>
                    </div>
                  ))}
                </div>
                <h3 style={{ fontFamily: 'var(--display)', fontSize: 17, margin: '28px 0 6px' }}>Digital check-in</h3>
                <p className="sub" style={{ marginBottom: 14 }}>Upload dit kørekort hjemmefra, så er alt klar når du henter bilen.</p>
                <label className="upload-area">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
                  <div className="ut">Upload billede af kørekort</div>
                  <div style={{ fontSize: 12.5 }}>Forside + bagside · JPG eller PNG</div>
                  <input type="file" accept="image/*" style={{ display: 'none' }} />
                </label>
                <div className="nav-btns">
                  <button className="btn ghost" onClick={() => setStep(1)}>← Tilbage</button>
                  <button className="btn" onClick={() => setStep(3)}>Fortsæt →</button>
                </div>
              </div>
            )}

            {/* Step 3 — Underskrift */}
            {step === 3 && (
              <div className="panel">
                <h2>Digital underskrift</h2>
                <p className="sub">Lejekontrakten er genereret automatisk. Underskriv sikkert med MitID.</p>
                <div className="sig-doc">
                  <h4>Lejekontrakt — Ølstykke Auto</h4>
                  <p><strong>Udlejer:</strong> Ølstykke Auto, Stationsvej 12, 3650 Ølstykke · CVR 12345678</p>
                  <p><strong>Lejer:</strong> {form.fornavn} {form.efternavn}, {form.adresse}, {form.postnr} {form.by}</p>
                  <p><strong>Køretøj:</strong> {car.navn} · Reg.nr. {car.reg_nr}</p>
                  <p><strong>Periode:</strong> {new Date(fra).toLocaleDateString('da-DK')} – {new Date(til).toLocaleDateString('da-DK')} ({dage} dage)</p>
                  <p><strong>Pris:</strong> {total.toLocaleString('da-DK')} kr. inkl. forsikring. Depositum {car.depositum.toLocaleString('da-DK')} kr. reserveres.</p>
                  <p>Lejer forpligter sig til at føre køretøjet forsvarligt, aflevere det i samme stand og med samme brændstofniveau. Bilen må ikke føres uden for EU. Skader skal anmeldes straks.</p>
                </div>
                <div className="providers">
                  {['MitID', 'Penneo', 'Scrive', 'Dropbox Sign'].map(p => (
                    <div key={p} className={`prov ${signProvider === p ? 'sel' : ''}`} onClick={() => setSignProvider(p)}>{p}</div>
                  ))}
                </div>
                <div className="sig-box">Underskriv via valgt udbyder — åbner sikkert vindue</div>
                <div className="nav-btns">
                  <button className="btn ghost" onClick={() => setStep(2)}>← Tilbage</button>
                  <button className="btn" onClick={() => setStep(4)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M3 17l6 6L21 5"/></svg>
                    Underskriv med {signProvider}
                  </button>
                </div>
              </div>
            )}

            {/* Step 4 — Betaling */}
            {step === 4 && (
              <div className="panel">
                <h2>Betaling</h2>
                <p className="sub">Vælg betalingsmetode. Beløbet trækkes først ved afhentning — depositum reserveres nu.</p>
                <div className="col gap-12">
                  {[
                    { id: 'MOBILEPAY', logo: 'MobilePay', style: { background: '#5a78ff', color: '#fff' }, label: 'Betal hurtigt med MobilePay' },
                    { id: 'KORT', logo: 'Kort', style: { background: 'var(--bg-2)', color: 'var(--ink)' }, label: 'Visa / Mastercard · via QuickPay' },
                  ].map(m => (
                    <div key={m.id} className={`pay-method ${payMethod === m.id ? 'sel' : ''}`} onClick={() => setPayMethod(m.id)}>
                      <span className="radio" />
                      <span className="pay-logo" style={m.style}>{m.logo}</span>
                      <span style={{ fontWeight: 600, fontSize: 14 }}>{m.label}</span>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--muted)' }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  Krypteret betaling via QuickPay. Vi gemmer aldrig dine kortoplysninger.
                </div>
                <div className="nav-btns">
                  <button className="btn ghost" onClick={() => setStep(3)}>← Tilbage</button>
                  <button className="btn lg" onClick={handleSubmitBooking} disabled={loading}>
                    {loading ? 'Behandler…' : `Betal ${fmt(total)} →`}
                  </button>
                </div>
              </div>
            )}

            {/* Step 5 — Bekræftelse */}
            {step === 5 && bookingResult && (
              <div className="panel">
                <div className="confirm">
                  <div className="ok">
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="oklch(0.55 0.14 155)" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </div>
                  <h2>Tak for din booking, {form.fornavn}!</h2>
                  <p className="sub" style={{ margin: '10px 0 0' }}>
                    Vi har sendt en bekræftelse og lejekontrakt til {bookingResult.customer_email}
                  </p>
                  <div className="book-no">{bookingResult.booking_nr}</div>
                  <div className="conf-cards">
                    <div className="conf-c">
                      <div className="ci"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 7l-10 6L2 7"/></svg></div>
                      <div className="ct">Bekræftelse sendt</div>
                      <div className="cd">Tjek din indbakke for detaljer og kvittering.</div>
                    </div>
                    <div className="conf-c">
                      <div className="ci"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg></div>
                      <div className="ct">Lejekontrakt (PDF)</div>
                      <div className="cd">Underskrevet og vedhæftet. Gem den til afhentning.</div>
                    </div>
                    <div className="conf-c">
                      <div className="ci"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg></div>
                      <div className="ct">Hent hos Ølstykke Auto</div>
                      <div className="cd">{new Date(fra).toLocaleDateString('da-DK')} · husk dit fysiske kørekort.</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginTop: 28 }}>
                    <button className="btn">Download kontrakt (PDF)</button>
                    <Link href="/" className="btn ghost">Til forsiden</Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Summary sidebar */}
          {step < 5 && (
            <aside className="summary">
              <div className="card">
                <ImageSlot
                  src={imgSrc}
                  placeholder={car.navn}
                  style={{ width: '100%', height: 130 }}
                />
                <div style={{ padding: 18 }}>
                  <div className="row between center">
                    <strong style={{ fontFamily: 'var(--display)', fontSize: 18 }}>{car.navn}</strong>
                    <span className="badge blue">{car.kategori}</span>
                  </div>
                  <p className="muted" style={{ fontSize: 13, marginTop: 4 }}>Ølstykke Auto · Reg. {car.reg_nr}</p>
                  <div className="sum-rows">
                    <div className="sr">
                      <span className="k">{new Date(fra).toLocaleDateString('da-DK', { day: 'numeric', month: 'short' })}–{new Date(til).toLocaleDateString('da-DK', { day: 'numeric', month: 'short' })} · {dage} dage</span>
                      <span className="v tnum">{fmt(basePris)}</span>
                    </div>
                    {EXTRAS.filter(e => extras.has(e.id)).map(e => (
                      <div key={e.id} className="sr">
                        <span className="k">{e.label}</span>
                        <span className="v tnum">{fmt(e.perDay ? e.price * dage : e.price)}</span>
                      </div>
                    ))}
                    <div className="sr">
                      <span className="k">Depositum (reserveres)</span>
                      <span className="v tnum">{fmt(car.depositum)}</span>
                    </div>
                  </div>
                  <div className="sum-total">
                    <span style={{ fontWeight: 700 }}>I alt at betale</span>
                    <span className="amt tnum">{fmt(total)}</span>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginTop: 14, fontSize: 12.5, color: 'var(--muted)', padding: '0 4px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.4"><polyline points="20 6 9 17 4 12"/></svg>
                Gratis afbestilling indtil 24t før
              </div>
            </aside>
          )}
        </div>
      </div>
    </>
  )
}
