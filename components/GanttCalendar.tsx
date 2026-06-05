'use client'
import { useState } from 'react'

interface Car { id: string; navn: string; reg_nr: string }
interface Booking {
  id: string
  booking_nr: string
  start: string
  slut: string
  status: string
  customer: { navn: string; telefon: string; email: string; koerekort_verificeret: boolean }
  total_pris: number
  betalingsstatus: string
  car: Car
}
interface Props {
  cars: Car[]
  bookings: Booking[]
  onBookingClick: (b: Booking) => void
}

const MONTHS = ['Januar','Februar','Marts','April','Maj','Juni','Juli','August','September','Oktober','November','December']
const DOW_SHORT = ['Sø','Ma','Ti','On','To','Fr','Lø']

export default function GanttCalendar({ cars, bookings, onBookingClick }: Props) {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())

  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  function isWeekend(day: number) {
    const d = new Date(year, month, day).getDay()
    return d === 0 || d === 6
  }
  function isToday(day: number) {
    return day === now.getDate() && month === now.getMonth() && year === now.getFullYear()
  }
  function dowLabel(day: number) {
    return DOW_SHORT[new Date(year, month, day).getDay()]
  }

  const cols = `170px repeat(${daysInMonth}, 1fr)`

  function barsForCar(carId: string) {
    return bookings
      .filter(b => b.car.id === carId)
      .map(b => {
        const s = new Date(b.start)
        const e = new Date(b.slut)
        const monthStart = new Date(year, month, 1)
        const monthEnd = new Date(year, month + 1, 0)
        if (e < monthStart || s > monthEnd) return null

        const fromDay = Math.max(1, s.getDate() - (s.getMonth() === month && s.getFullYear() === year ? 0 : daysInMonth))
        const toDay = Math.min(daysInMonth, e.getDate() - (e.getMonth() === month && e.getFullYear() === year ? 0 : 0) + (e.getMonth() !== month || e.getFullYear() !== year ? daysInMonth : 0))

        const fd = s.getMonth() === month && s.getFullYear() === year ? s.getDate() : 1
        const td = e.getMonth() === month && e.getFullYear() === year ? e.getDate() : daysInMonth

        const left = ((fd - 1) / daysInMonth) * 100
        const width = ((td - fd + 1) / daysInMonth) * 100
        const isOut = b.status === 'UDLEJET'

        return (
          <div
            key={b.id}
            className={`gantt-bar ${isOut ? 'out' : 'res'}`}
            style={{ left: `${left}%`, width: `calc(${width}% - 6px)`, marginLeft: 3 }}
            onClick={() => onBookingClick(b)}
            title={`${b.customer.navn} · ${b.booking_nr}`}
          >
            {b.customer.navn}
            <span className="sub">{b.booking_nr}</span>
          </div>
        )
      }).filter(Boolean)
  }

  function prev() {
    if (month === 0) { setMonth(11); setYear(y => y - 1) } else setMonth(m => m - 1)
  }
  function next() {
    if (month === 11) { setMonth(0); setYear(y => y + 1) } else setMonth(m => m + 1)
  }

  return (
    <div className="cal-wrap" style={{ overflowX: 'auto' }}>
      <div className="cal-month">
        <span className="mtitle">{MONTHS[month]} {year}</span>
        <div className="cal-nav">
          <button onClick={prev}>‹</button>
          <button onClick={next}>›</button>
        </div>
      </div>

      <div style={{ minWidth: 900 }}>
        {/* Header */}
        <div className="gantt-head" style={{ gridTemplateColumns: cols }}>
          <div className="corner">Køretøj</div>
          {days.map(d => (
            <div key={d} className={`dcell ${isWeekend(d) ? 'we' : ''} ${isToday(d) ? 'today' : ''}`}>
              <div className="dn">{d}</div>
              <div className="dw">{dowLabel(d)}</div>
            </div>
          ))}
        </div>

        {/* Rows */}
        {cars.map(car => (
          <div key={car.id} className="gantt-row" style={{ gridTemplateColumns: '170px 1fr' }}>
            <div className="carcell">
              <div className="cn">{car.navn}</div>
              <div className="cr">{car.reg_nr}</div>
            </div>
            <div className="gantt-track" style={{ position: 'relative' }}>
              {days.map(d => (
                <div
                  key={d}
                  className={`gcell ${isWeekend(d) ? 'we' : ''} ${isToday(d) ? 'today' : ''}`}
                  style={{ left: `${((d - 1) / daysInMonth) * 100}%`, width: `${(1 / daysInMonth) * 100}%` }}
                />
              ))}
              {barsForCar(car.id)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
