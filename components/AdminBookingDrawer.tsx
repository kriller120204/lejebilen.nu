'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { fmt } from '@/lib/utils'

interface Customer {
  id: string; navn: string; email: string; telefon: string
}
interface Car {
  id: string; navn: string; reg_nr: string; pris_dag: number; status: string
}

interface Props {
  open: boolean
  onClose: () => void
  onSaved: () => void
}

const EMPTY_KUNDE = { navn: '', email: '', telefon: '', adresse: '' }

function today(offsetDays = 0) {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  return d.toISOString().slice(0, 16)
}

function daysBetween(a: string, b: string) {
  return Math.max(1, Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000))
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('da-DK', { weekday: 'short', day: 'numeric', month: 'short' })
}

export default function AdminBookingDrawer({ open, onClose, onSaved }: Props) {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [cars, setCars] = useState<Car[]>([])
  const [search, setSearch] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [nyKunde, setNyKunde] = useState(false)
  const [kundeForm, setKundeForm] = useState(EMPTY_KUNDE)
  const [carId, setCarId] = useState('')
  const [start, setStart] = useState(today())
  const [slut, setSlut] = useState(today(1))
  const [totalPris, setTotalPris] = useState(0)
  const [prisManuelt, setPrisManuelt] = useState(false)
  const [betaling, setBetaling] = useState<'AFVENTER' | 'BETALT'>('BETALT')
  const [noter, setNoter] = useState('')
  const [gentagUger, setGentagUger] = useState(0)
  const [gentagAktiv, setGentagAktiv] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const searchRef = useRef<HTMLInputElement>(null)

  const load = useCallback(async () => {
    const [cRes, kRes] = await Promise.all([
      fetch('/api/cars?all=1'),
      fetch('/api/customers'),
    ])
    if (cRes.ok) setCars(await cRes.json())
    if (kRes.ok) setCustomers(await kRes.json())
  }, [])

  useEffect(() => {
    if (open) {
      load()
      reset()
      setTimeout(() => searchRef.current?.focus(), 50)
    }
  }, [open, load])

  // Auto-beregn pris
  useEffect(() => {
    if (prisManuelt) return
    const car = cars.find(c => c.id === carId)
    if (car && start && slut) {
      setTotalPris(car.pris_dag * daysBetween(start, slut))
    }
  }, [carId, start, slut, cars, prisManuelt])

  function reset() {
    setSearch(''); setSelectedCustomer(null); setNyKunde(false)
    setKundeForm(EMPTY_KUNDE); setCarId(''); setStart(today())
    setSlut(today(1)); setTotalPris(0); setPrisManuelt(false)
    setBetaling('BETALT'); setNoter(''); setGentagUger(0)
    setGentagAktiv(false); setError('')
  }

  const filteredCustomers = customers.filter(c =>
    c.navn.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.telefon.includes(search)
  ).slice(0, 6)

  const selectedCar = cars.find(c => c.id === carId)
  const antalBookinger = gentagAktiv ? 1 + gentagUger : 1

  function previewDatoer() {
    return Array.from({ length: antalBookinger }, (_, i) => {
      const s = new Date(new Date(start).getTime() + i * 7 * 86400000)
      const e = new Date(new Date(slut).getTime() + i * 7 * 86400000)
      return `${fmtDate(s.toISOString())} – ${fmtDate(e.toISOString())}`
    })
  }

  async function handleSave() {
    setError('')
    if (!selectedCustomer && !nyKunde) return setError('Vælg eller opret en kunde')
    if (nyKunde && (!kundeForm.navn || !kundeForm.email || !kundeForm.telefon)) return setError('Udfyld alle kundefelter')
    if (!carId) return setError('Vælg en bil')
    if (!start || !slut || new Date(slut) <= new Date(start)) return setError('Ugyldig periode')
    if (totalPris <= 0) return setError('Pris skal være over 0')

    setSaving(true)
    try {
      const body = {
        ...(selectedCustomer ? { customer_id: selectedCustomer.id } : { ny_kunde: kundeForm }),
        car_id: carId,
        start,
        slut,
        total_pris: totalPris,
        noter: noter || undefined,
        betalingsstatus: betaling,
        gentag_uger: gentagAktiv ? gentagUger : 0,
      }
      const res = await fetch('/api/admin/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(JSON.stringify(err))
      }
      onSaved()
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ukendt fejl')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <div className={`drawer-back ${open ? 'open' : ''}`} onClick={onClose} />
      <aside className={`drawer ${open ? 'open' : ''}`} style={{ width: 520 }}>
        <div className="dr-head">
          <div>
            <h2 style={{ fontSize: 20 }}>Ny booking</h2>
            <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>Opret booking på vegne af kunde</div>
          </div>
          <button type="button" className="close-x" onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="dr-body">
          <div className="col gap-24">

            {/* ── Kunde ─────────────────────────────────────────── */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <div className="dr-sec-label">Kunde</div>
                <button
                  type="button"
                  style={{ fontSize: 12.5, color: 'var(--blue)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                  onClick={() => { setNyKunde(v => !v); setSelectedCustomer(null); setSearch('') }}
                >
                  {nyKunde ? '← Søg eksisterende' : '+ Ny kunde'}
                </button>
              </div>

              {!nyKunde ? (
                <>
                  {selectedCustomer ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: 'var(--blue-tint)', border: '1px solid var(--blue)', borderRadius: 'var(--r)', cursor: 'pointer' }}
                      onClick={() => setSelectedCustomer(null)}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--blue)', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
                        {selectedCustomer.navn.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{selectedCustomer.navn}</div>
                        <div style={{ fontSize: 12.5, color: 'var(--muted)' }}>{selectedCustomer.email} · {selectedCustomer.telefon}</div>
                      </div>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                    </div>
                  ) : (
                    <>
                      <input
                        ref={searchRef}
                        className="input"
                        placeholder="Søg navn, email eller telefon…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                      />
                      {search.length > 0 && (
                        <div style={{ border: '1px solid var(--line)', borderRadius: 'var(--r)', overflow: 'hidden', marginTop: 6 }}>
                          {filteredCustomers.length === 0 ? (
                            <div style={{ padding: '12px 14px', fontSize: 13.5, color: 'var(--muted)' }}>Ingen kunder fundet</div>
                          ) : filteredCustomers.map(c => (
                            <div key={c.id}
                              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid var(--line)' }}
                              className="admin-search-row"
                              onClick={() => { setSelectedCustomer(c); setSearch('') }}
                            >
                              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--blue-tint)', color: 'var(--blue-700)', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 12, flexShrink: 0 }}>
                                {c.navn.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()}
                              </div>
                              <div>
                                <div style={{ fontWeight: 600, fontSize: 14 }}>{c.navn}</div>
                                <div style={{ fontSize: 12, color: 'var(--muted)' }}>{c.email}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {[
                    { k: 'navn', lbl: 'Navn', full: true },
                    { k: 'email', lbl: 'Email', full: true },
                    { k: 'telefon', lbl: 'Telefon', full: false },
                    { k: 'adresse', lbl: 'Adresse', full: false },
                  ].map(({ k, lbl, full }) => (
                    <div key={k} className="field" style={full ? { gridColumn: '1/-1' } : {}}>
                      <label>{lbl}</label>
                      <input className="input" value={(kundeForm as Record<string, string>)[k]} onChange={e => setKundeForm(f => ({ ...f, [k]: e.target.value }))} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── Bil ───────────────────────────────────────────── */}
            <div className="field">
              <div className="dr-sec-label" style={{ marginBottom: 8 }}>Bil</div>
              <select className="input" value={carId} onChange={e => { setCarId(e.target.value); setPrisManuelt(false) }}>
                <option value="">Vælg bil…</option>
                {cars.filter(c => c.status !== 'UDGAAET').map(c => (
                  <option key={c.id} value={c.id}>
                    {c.navn} ({c.reg_nr}) — {fmt(c.pris_dag)}/dag
                  </option>
                ))}
              </select>
            </div>

            {/* ── Periode ───────────────────────────────────────── */}
            <div>
              <div className="dr-sec-label" style={{ marginBottom: 10 }}>Periode</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="field">
                  <label>Afhentning</label>
                  <input className="input" type="datetime-local" value={start} onChange={e => setStart(e.target.value)} />
                </div>
                <div className="field">
                  <label>Aflevering</label>
                  <input className="input" type="datetime-local" value={slut} min={start} onChange={e => setSlut(e.target.value)} />
                </div>
              </div>
              {start && slut && new Date(slut) > new Date(start) && (
                <div style={{ marginTop: 8, fontSize: 13, color: 'var(--muted)' }}>
                  {daysBetween(start, slut)} {daysBetween(start, slut) === 1 ? 'dag' : 'dage'}
                  {selectedCar ? ` · ${fmt(selectedCar.pris_dag * daysBetween(start, slut))} total` : ''}
                </div>
              )}
            </div>

            {/* ── Pris & betaling ───────────────────────────────── */}
            <div>
              <div className="dr-sec-label" style={{ marginBottom: 10 }}>Pris & betaling</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="field">
                  <label>Total pris (kr.)</label>
                  <input
                    className="input"
                    type="number"
                    value={totalPris}
                    onChange={e => { setTotalPris(+e.target.value); setPrisManuelt(true) }}
                  />
                </div>
                <div className="field">
                  <label>Betalingsstatus</label>
                  <select className="input" value={betaling} onChange={e => setBetaling(e.target.value as 'AFVENTER' | 'BETALT')}>
                    <option value="BETALT">Betalt</option>
                    <option value="AFVENTER">Afventer betaling</option>
                  </select>
                </div>
              </div>
            </div>

            {/* ── Noter ─────────────────────────────────────────── */}
            <div className="field">
              <div className="dr-sec-label" style={{ marginBottom: 8 }}>Interne noter</div>
              <textarea className="input" rows={2} value={noter} onChange={e => setNoter(e.target.value)} placeholder="Fx. aftalte vilkår, særlige hensyn…" />
            </div>

            {/* ── Gentagen booking ──────────────────────────────── */}
            <div style={{ border: '1px solid var(--line)', borderRadius: 'var(--r)', overflow: 'hidden' }}>
              <div
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', cursor: 'pointer', background: gentagAktiv ? 'var(--blue-tint)' : 'var(--bg-2)' }}
                onClick={() => setGentagAktiv(v => !v)}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14.5 }}>Gentagen booking</div>
                  <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 2 }}>Fx. samme kunde lejer hver mandag</div>
                </div>
                <div className={`switch ${gentagAktiv ? 'on' : ''}`} style={{ flexShrink: 0 }}>
                  <span className="knob" />
                </div>
              </div>

              {gentagAktiv && (
                <div style={{ padding: '16px', borderTop: '1px solid var(--line)', background: 'var(--surface)' }}>
                  <div className="field">
                    <label>Gentag i antal uger (ud over første)</label>
                    <input
                      className="input"
                      type="number"
                      min={1}
                      max={52}
                      value={gentagUger}
                      onChange={e => setGentagUger(Math.max(1, +e.target.value))}
                    />
                  </div>
                  {start && slut && gentagUger > 0 && (
                    <div style={{ marginTop: 12, background: 'var(--bg-2)', borderRadius: 8, padding: '10px 14px' }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>
                        Opretter {antalBookinger} bookinger
                      </div>
                      {previewDatoer().map((d, i) => (
                        <div key={i} style={{ fontSize: 13, color: 'var(--ink-soft)', padding: '3px 0', display: 'flex', gap: 8, alignItems: 'center' }}>
                          <span style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--blue)', color: '#fff', display: 'inline-grid', placeItems: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{i + 1}</span>
                          {d}
                        </div>
                      ))}
                      <div style={{ marginTop: 10, fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>
                        Total: {fmt(totalPris * antalBookinger)}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ── Fejl & gem ────────────────────────────────────── */}
            {error && (
              <div style={{ background: 'var(--red-bg)', color: 'var(--red)', borderRadius: 8, padding: '10px 14px', fontSize: 13.5, fontWeight: 600 }}>
                {error}
              </div>
            )}

            <div className="row gap-12">
              <button type="button" className="btn block" onClick={handleSave} disabled={saving}>
                {saving ? 'Opretter…' : antalBookinger > 1 ? `Opret ${antalBookinger} bookinger` : 'Opret booking'}
              </button>
              <button type="button" className="btn ghost" onClick={onClose} disabled={saving}>Annullér</button>
            </div>

          </div>
        </div>
      </aside>
    </>
  )
}
