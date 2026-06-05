'use client'
import { useState } from 'react'
import CarCard from './CarCard'
import { kategoriLabel } from '@/lib/utils'

interface Car {
  id: string
  navn: string
  kategori: string
  gear: string
  braendstof: string
  saeder: number
  pris_dag: number
  beskrivelse?: string | null
  images?: Array<{ url: string }>
}

interface Props {
  cars: Car[]
  pickupDate?: string
  returnDate?: string
}

const FILTERS = [
  { key: 'all', label: 'Alle' },
  { key: 'LILLE', label: 'Lille bil' },
  { key: 'MELLEMKLASSE', label: 'Mellemklasse' },
  { key: 'STATIONCAR', label: 'Stationcar' },
  { key: 'VAREBIL', label: 'Varebil' },
  { key: 'EL', label: 'El' },
]

export default function CarGrid({ cars, pickupDate, returnDate }: Props) {
  const [activeFilter, setActiveFilter] = useState('all')

  const filtered = activeFilter === 'all'
    ? cars
    : cars.filter(c => c.kategori === activeFilter)

  return (
    <div>
      <div className="filters" style={{ marginBottom: 28 }}>
        {FILTERS.map(f => (
          <button
            key={f.key}
            className={`filter ${activeFilter === f.key ? 'active' : ''}`}
            onClick={() => setActiveFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--muted)' }}>
          <p>Ingen ledige biler i denne kategori.</p>
        </div>
      ) : (
        <div className="car-grid">
          {filtered.map(car => (
            <CarCard
              key={car.id}
              car={car}
              pickupDate={pickupDate}
              returnDate={returnDate}
            />
          ))}
        </div>
      )}
    </div>
  )
}
