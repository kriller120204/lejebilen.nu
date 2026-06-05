'use client'
import { useState, useEffect, useCallback } from 'react'
import CarDrawer from '@/components/CarDrawer'
import ImageSlot from '@/components/ImageSlot'
import { kategoriLabel, gearLabel, fmt } from '@/lib/utils'

interface Car {
  id: string; navn: string; reg_nr: string; kategori: string; gear: string
  braendstof: string; saeder: number; pris_dag: number; depositum: number
  km_per_dag: number; status: string; beskrivelse?: string | null
  images?: Array<{ id: string; url: string }>
}

const STATUS_LABEL: Record<string, string> = {
  LEDIG: 'Ledig', UDLEJET: 'Udlejet', SERVICE: 'Service', UDGAAET: 'Udgået',
}
const STATUS_CLASS: Record<string, string> = {
  LEDIG: 'green', UDLEJET: 'blue', SERVICE: 'amber', UDGAAET: 'gray',
}

export default function BilerPage() {
  const [cars, setCars] = useState<Car[]>([])
  const [drawerCar, setDrawerCar] = useState<Car | null>(null)
  const [isNew, setIsNew] = useState(false)

  const load = useCallback(async () => {
    const res = await fetch('/api/cars?all=1')
    if (res.ok) setCars(await res.json())
  }, [])

  useEffect(() => { load() }, [load])

  function openNew() { setIsNew(true); setDrawerCar({} as Car) }
  function openEdit(car: Car) { setIsNew(false); setDrawerCar(car) }
  function closeDrawer() { setDrawerCar(null); setIsNew(false) }

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Biler</h1>
          <p className="sub">{cars.length} køretøjer i flåden</p>
        </div>
        <button className="btn" onClick={openNew}>+ Ny bil</button>
      </div>

      <div className="car-admin-grid">
        {cars.map(car => (
          <div key={car.id} className="car-admin-card card" onClick={() => openEdit(car)}>
            <ImageSlot
              src={car.images?.[0]?.url ?? null}
              placeholder={car.navn}
              style={{ width: '100%', height: 140 }}
            />
            <div style={{ padding: 16 }}>
              <div className="row between center">
                <strong style={{ fontFamily: 'var(--display)', fontSize: 15.5 }}>{car.navn}</strong>
                <span className={`badge ${STATUS_CLASS[car.status] ?? 'gray'}`}>{STATUS_LABEL[car.status] ?? car.status}</span>
              </div>
              <p className="muted mono" style={{ fontSize: 12.5, marginTop: 4 }}>{car.reg_nr}</p>
              <div className="spec-row" style={{ marginTop: 12, gap: 10, fontSize: 13 }}>
                <span>{kategoriLabel(car.kategori)}</span>
                <span>·</span>
                <span>{gearLabel(car.gear)}</span>
                <span>·</span>
                <span>{car.saeder} pers.</span>
              </div>
              <div style={{ marginTop: 10, fontFamily: 'var(--display)', fontWeight: 700, fontSize: 17 }}>
                {fmt(car.pris_dag)}<span style={{ fontWeight: 400, fontSize: 13, color: 'var(--muted)' }}>/dag</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <CarDrawer
        car={isNew ? null : drawerCar}
        isNew={isNew}
        onClose={closeDrawer}
        onSaved={load}
      />
    </div>
  )
}
