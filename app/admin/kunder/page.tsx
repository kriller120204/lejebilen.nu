'use client'
import { useState, useEffect, useCallback } from 'react'
import CustomerDrawer from '@/components/CustomerDrawer'
import { initials } from '@/lib/utils'

interface Customer {
  id: string; navn: string; email: string; telefon: string
  adresse?: string | null; postnr?: string | null; by?: string | null
  koerekort_verificeret: boolean; oprettet: string
  bookings?: Array<{ id: string; booking_nr: string; start: string; slut: string; total_pris: number; car: { navn: string } }>
  _count?: { bookings: number }
}

const HUES = [256, 155, 25, 78, 300, 200, 120, 350, 30, 180]
function hue(navn: string) {
  let h = 0
  for (const c of navn) h = (h * 31 + c.charCodeAt(0)) % HUES.length
  return HUES[h]
}

export default function KunderPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [selected, setSelected] = useState<Customer | null>(null)
  const [search, setSearch] = useState('')

  const load = useCallback(async () => {
    const res = await fetch('/api/customers?include=bookings')
    if (res.ok) setCustomers(await res.json())
  }, [])

  useEffect(() => { load() }, [load])

  const filtered = customers.filter(c =>
    c.navn.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.telefon.includes(search)
  )

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Kunder</h1>
          <p className="sub">{customers.length} registrerede kunder</p>
        </div>
        <div className="search-wrap">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          <input
            className="input"
            placeholder="Søg efter navn, email eller telefon…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: 32 }}
          />
        </div>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th>Kunde</th>
                <th>Telefon</th>
                <th>Email</th>
                <th>Kørekort</th>
                <th>Lejemål</th>
                <th>Oprettet</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id} className="clickable" onClick={() => setSelected(c)}>
                  <td>
                    <div className="row gap-10 center">
                      <div
                        className="cust-av"
                        style={{ width: 34, height: 34, fontSize: 13, flexShrink: 0, background: `oklch(0.6 0.13 ${hue(c.navn)})` }}
                      >
                        {initials(c.navn)}
                      </div>
                      <span style={{ fontWeight: 600 }}>{c.navn}</span>
                    </div>
                  </td>
                  <td>{c.telefon}</td>
                  <td style={{ fontSize: 13.5 }}>{c.email}</td>
                  <td>
                    <span className={`badge ${c.koerekort_verificeret ? 'green' : 'amber'}`}>
                      {c.koerekort_verificeret ? 'Verificeret' : 'Afventer'}
                    </span>
                  </td>
                  <td className="tnum">{c._count?.bookings ?? c.bookings?.length ?? 0}</td>
                  <td style={{ fontSize: 13 }}>
                    {new Date(c.oprettet).toLocaleDateString('da-DK', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <CustomerDrawer customer={selected} onClose={() => setSelected(null)} />
    </div>
  )
}
