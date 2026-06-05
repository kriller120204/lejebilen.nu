'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

function today() {
  return new Date().toISOString().slice(0, 10)
}
function addDays(d: string, n: number) {
  const dt = new Date(d)
  dt.setDate(dt.getDate() + n)
  return dt.toISOString().slice(0, 10)
}

export default function SearchBox() {
  const router = useRouter()
  const [fra, setFra] = useState(today())
  const [fraTid, setFraTid] = useState('09:00')
  const [til, setTil] = useState(addDays(today(), 2))
  const [tilTid, setTilTid] = useState('09:00')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams({ fra: `${fra}T${fraTid}`, til: `${til}T${tilTid}` })
    router.push(`/#biler?${params}`)
  }

  return (
    <form className="searchbox" onSubmit={handleSubmit}>
      <div className="sb-field">
        <label>Afhentningsdato</label>
        <input type="date" value={fra} min={today()} onChange={e => setFra(e.target.value)} />
      </div>
      <div className="sb-field">
        <label>Tidspunkt</label>
        <input type="time" value={fraTid} onChange={e => setFraTid(e.target.value)} />
      </div>
      <div className="sb-field">
        <label>Afleveringsdato</label>
        <input type="date" value={til} min={fra} onChange={e => setTil(e.target.value)} />
      </div>
      <div className="sb-field">
        <label>Tidspunkt</label>
        <input type="time" value={tilTid} onChange={e => setTilTid(e.target.value)} />
      </div>
      <button className="btn lg" type="submit">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3">
          <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.3-4.3"/>
        </svg>
        Se ledige biler
      </button>
    </form>
  )
}
