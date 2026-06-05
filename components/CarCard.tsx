import Link from 'next/link'
import ImageSlot from './ImageSlot'
import { kategoriLabel, gearLabel, braendstofLabel } from '@/lib/utils'

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
  tag?: string
  tagClass?: string
}

interface Props {
  car: Car
  pickupDate?: string
  returnDate?: string
}

const TAG_MAP: Record<string, { label: string; cls: string }> = {
  LILLE: { label: 'Populær', cls: 'blue' },
  EL: { label: 'Ny', cls: 'blue' },
  VAREBIL: { label: 'Flytning', cls: 'amber' },
}

const GearIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="3"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/>
  </svg>
)
const FuelIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 22V4a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v18M3 12h10M16 8l3 3v7a2 2 0 0 0 2 0v-9l-3-3"/>
  </svg>
)
const SeatIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
)

export default function CarCard({ car, pickupDate, returnDate }: Props) {
  const imgSrc = car.images?.[0]?.url ?? null
  const tag = TAG_MAP[car.kategori]
  const href = pickupDate && returnDate
    ? `/biler/${car.id}?fra=${pickupDate}&til=${returnDate}`
    : `/biler/${car.id}`

  return (
    <Link className="car-card" href={href}>
      <div className="media" style={{ position: 'relative' }}>
        <ImageSlot
          src={imgSrc}
          placeholder={`${car.navn} — produktfoto`}
          style={{ width: '100%', height: 188 }}
        />
        {tag && <span className={`badge ${tag.cls ?? 'blue'} tag`}>{tag.label}</span>}
      </div>
      <div className="body">
        <div className="car-top">
          <div>
            <h3>{car.navn}</h3>
            <div className="car-cat">{kategoriLabel(car.kategori)}</div>
          </div>
        </div>
        <div className="specs">
          <span className="spec"><GearIcon /> {gearLabel(car.gear)}</span>
          <span className="spec"><FuelIcon /> {braendstofLabel(car.braendstof)}</span>
          <span className="spec"><SeatIcon /> {car.saeder} sæder</span>
        </div>
        {car.beskrivelse && <p className="car-desc">{car.beskrivelse}</p>}
        <div className="car-foot">
          <div className="price">
            <div className="from">Fra</div>
            <span className="amt tnum">{car.pris_dag}</span>
            <span className="per"> kr./dag</span>
          </div>
          <span className="btn sm">Se bil →</span>
        </div>
      </div>
    </Link>
  )
}
