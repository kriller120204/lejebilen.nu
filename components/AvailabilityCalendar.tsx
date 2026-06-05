'use client'
import { useState } from 'react'

interface BookedRange {
  start: Date | string
  slut: Date | string
  status: string
}

interface Props {
  bookings: BookedRange[]
}

const DOW = ['M', 'T', 'O', 'T', 'F', 'L', 'S']
const MONTHS = ['Januar','Februar','Marts','April','Maj','Juni','Juli','August','September','Oktober','November','December']

function getFirstMonday(year: number, month: number) {
  const d = new Date(year, month, 1)
  const dow = d.getDay()
  return dow === 1 ? 0 : dow === 0 ? -6 : 1 - dow
}

export default function AvailabilityCalendar({ bookings }: Props) {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())

  function dayState(day: number): 'free' | 'res' | 'out' | 'past' {
    const d = new Date(year, month, day)
    if (d < new Date(now.getFullYear(), now.getMonth(), now.getDate())) return 'past'
    for (const b of bookings) {
      const s = new Date(b.start)
      const e = new Date(b.slut)
      if (d >= s && d < e) {
        return b.status === 'UDLEJET' ? 'out' : 'res'
      }
    }
    return 'free'
  }

  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDow = new Date(year, month, 1).getDay()
  const offset = firstDow === 0 ? 6 : firstDow - 1

  function prev() {
    if (month === 0) { setMonth(11); setYear(y => y - 1) } else setMonth(m => m - 1)
  }
  function next() {
    if (month === 11) { setMonth(0); setYear(y => y + 1) } else setMonth(m => m + 1)
  }

  return (
    <div className="cal">
      <div className="cal-head">
        <span className="m">{MONTHS[month]} {year}</span>
        <span style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            onClick={prev}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: 18, lineHeight: 1 }}
          >‹</button>
          <button
            onClick={next}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: 18, lineHeight: 1 }}
          >›</button>
        </span>
      </div>
      <div className="cal-grid">
        {DOW.map(d => <div key={d} className="cal-dow">{d}</div>)}
        {Array.from({ length: offset }, (_, i) => (
          <div key={`e-${i}`} className="cal-day empty" />
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1
          const state = dayState(day)
          return (
            <div key={day} className={`cal-day ${state}`} title={state === 'free' ? 'Ledig' : state === 'res' ? 'Reserveret' : state === 'out' ? 'Udlejet' : ''}>
              {day}
            </div>
          )
        })}
      </div>
      <div className="cal-legend">
        <span><span className="dot green"></span> Ledig</span>
        <span><span className="dot amber"></span> Reserveret</span>
        <span><span className="dot red"></span> Udlejet</span>
      </div>
    </div>
  )
}
