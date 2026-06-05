'use client'
import { useState, useEffect, useCallback } from 'react'
import GanttCalendar from '@/components/GanttCalendar'
import BookingDrawer from '@/components/BookingDrawer'

interface Car { id: string; navn: string; reg_nr: string }
interface Booking {
  id: string; booking_nr: string; status: string; total_pris: number
  betalingsstatus: string; start: string; slut: string
  car: Car
  customer: { navn: string; telefon: string; email: string; koerekort_verificeret: boolean }
  payments?: Array<{ metode: string; status: string }>
  contract?: { pdf_url?: string | null; signeret_af?: string | null } | null
}

export default function BookingerPage() {
  const [cars, setCars] = useState<Car[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [selected, setSelected] = useState<Booking | null>(null)
  const [view, setView] = useState<'gantt' | 'list'>('gantt')

  const load = useCallback(async () => {
    const [carsRes, bookRes] = await Promise.all([
      fetch('/api/cars'),
      fetch('/api/bookings?include=all'),
    ])
    if (carsRes.ok) setCars(await carsRes.json())
    if (bookRes.ok) setBookings(await bookRes.json())
  }, [])

  useEffect(() => { load() }, [load])

  const STATUS_LABEL: Record<string, string> = {
    AFVENTER: 'Afventer', BEKRAEFTET: 'Bekræftet', AKTIV: 'Aktiv',
    UDLEJET: 'Udlejet', AFSLUTTET: 'Afsluttet', ANNULLERET: 'Annulleret',
  }
  const STATUS_CLASS: Record<string, string> = {
    AFVENTER: 'amber', BEKRAEFTET: 'blue', AKTIV: 'green',
    UDLEJET: 'blue', AFSLUTTET: 'gray', ANNULLERET: 'red',
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Bookinger</h1>
          <p className="sub">{bookings.length} bookinger i alt</p>
        </div>
        <div className="row gap-8">
          <button className={`btn sm ${view === 'gantt' ? '' : 'ghost'}`} onClick={() => setView('gantt')}>
            Kalender
          </button>
          <button className={`btn sm ${view === 'list' ? '' : 'ghost'}`} onClick={() => setView('list')}>
            Liste
          </button>
        </div>
      </div>

      {view === 'gantt' ? (
        <div className="card" style={{ padding: 24 }}>
          <GanttCalendar
            cars={cars}
            bookings={bookings}
            onBookingClick={b => setSelected(b)}
          />
        </div>
      ) : (
        <div className="card">
          <div className="table-wrap">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Booking nr.</th>
                  <th>Kunde</th>
                  <th>Bil</th>
                  <th>Periode</th>
                  <th>Status</th>
                  <th>Beløb</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(b => (
                  <tr key={b.id} className="clickable" onClick={() => setSelected(b)}>
                    <td className="mono">{b.booking_nr}</td>
                    <td>{b.customer.navn}</td>
                    <td>{b.car.navn}</td>
                    <td style={{ fontSize: 13 }}>
                      {new Date(b.start).toLocaleDateString('da-DK', { day: 'numeric', month: 'short' })}
                      {' – '}
                      {new Date(b.slut).toLocaleDateString('da-DK', { day: 'numeric', month: 'short' })}
                    </td>
                    <td><span className={`badge ${STATUS_CLASS[b.status] ?? 'gray'}`}>{STATUS_LABEL[b.status] ?? b.status}</span></td>
                    <td className="tnum">{b.total_pris.toLocaleString('da-DK')} kr.</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <BookingDrawer
        booking={selected}
        onClose={() => setSelected(null)}
        onUpdate={load}
      />
    </div>
  )
}
