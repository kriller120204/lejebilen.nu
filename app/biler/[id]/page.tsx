import { notFound } from 'next/navigation'
import Link from 'next/link'
import { db } from '@/lib/db'
import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'
import ImageSlot from '@/components/ImageSlot'
import AvailabilityCalendar from '@/components/AvailabilityCalendar'
import { fmt, kategoriLabel, gearLabel, braendstofLabel } from '@/lib/utils'

interface Props {
  params: Promise<{ id: string }>
  searchParams: Promise<{ fra?: string; til?: string }>
}

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: Props) {
  const { id } = await params
  const car = await db.car.findUnique({ where: { id } })
  if (!car) return {}
  return { title: `${car.navn} – Lejebilen.nu` }
}

export default async function CarDetailPage({ params, searchParams }: Props) {
  const { id } = await params
  const { fra, til } = await searchParams

  const car = await db.car.findUnique({
    where: { id },
    include: {
      images: true,
      bookings: {
        where: { status: { notIn: ['ANNULLERET'] } },
        select: { start: true, slut: true, status: true },
      },
    },
  })

  if (!car) notFound()

  const bookings = car.bookings.map(b => ({
    start: b.start.toISOString(),
    slut: b.slut.toISOString(),
    status: b.status,
  }))

  const fraParam = fra ?? new Date().toISOString().slice(0, 16)
  const tilParam = til ?? new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 16)

  const imgSrc = car.images[0]?.url ?? null
  const thumbs = car.images.slice(1, 5)

  return (
    <>
      <SiteHeader />

      <div className="det-wrap wrap">
        {/* Breadcrumb */}
        <nav className="breadcrumb">
          <Link href="/">Forside</Link>
          <span>›</span>
          <Link href="/#biler">Biler</Link>
          <span>›</span>
          <span>{car.navn}</span>
        </nav>

        <div className="det-layout">
          {/* Left: gallery + info */}
          <div>
            {/* Gallery */}
            <div className="gallery">
              <div className="main-img">
                <ImageSlot src={imgSrc} placeholder={car.navn} style={{ width: '100%', height: 380 }} />
              </div>
              {thumbs.length > 0 && (
                <div className="thumbs">
                  {thumbs.map((img, i) => (
                    <ImageSlot key={i} src={img.url} placeholder={car.navn} style={{ width: '100%', aspectRatio: '4/3' }} />
                  ))}
                </div>
              )}
            </div>

            {/* Specs */}
            <div className="card" style={{ marginTop: 20, padding: 24 }}>
              <h2 className="sub-head">Om {car.navn}</h2>
              <div className="spec-grid">
                <div className="spec">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth="2">
                    <circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
                  </svg>
                  <span className="sk">Kategori</span>
                  <span className="sv">{kategoriLabel(car.kategori)}</span>
                </div>
                <div className="spec">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth="2">
                    <path d="M14.5 10c-.83 0-1.5-.67-1.5-1.5v-5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5v5c0 .83-.67 1.5-1.5 1.5z"/>
                    <path d="M20.5 10H19V8.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
                    <path d="M9.5 14c.83 0 1.5.67 1.5 1.5v5c0 .83-.67 1.5-1.5 1.5S8 21.33 8 20.5v-5c0-.83.67-1.5 1.5-1.5z"/>
                    <path d="M3.5 14H5v1.5c0 .83-.67 1.5-1.5 1.5S2 16.33 2 15.5 2.67 14 3.5 14z"/>
                    <path d="M14 14.5c0-.83.67-1.5 1.5-1.5h5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-5c-.83 0-1.5-.67-1.5-1.5z"/>
                    <path d="M15.5 9H17v1.5c0 .83-.67 1.5-1.5 1.5S14 11.33 14 10.5V9h1.5z"/>
                    <path d="M10 9.5C10 8.67 9.33 8 8.5 8H3.5C2.67 8 2 8.67 2 9.5S2.67 11 3.5 11h5c.83 0 1.5-.67 1.5-1.5z"/>
                    <path d="M8.5 15H7v-1.5c0-.83.67-1.5 1.5-1.5S10 12.67 10 13.5V15H8.5z"/>
                  </svg>
                  <span className="sk">Gear</span>
                  <span className="sv">{gearLabel(car.gear)}</span>
                </div>
                <div className="spec">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth="2">
                    <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-8 2a2 2 0 1 1-4 0 2 2 0 0 1 4 0z"/>
                  </svg>
                  <span className="sk">Brændstof</span>
                  <span className="sv">{braendstofLabel(car.braendstof)}</span>
                </div>
                <div className="spec">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                  <span className="sk">Sæder</span>
                  <span className="sv">{car.saeder} pers.</span>
                </div>
                <div className="spec">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                  </svg>
                  <span className="sk">Fri km/dag</span>
                  <span className="sv">{car.km_per_dag} km</span>
                </div>
                <div className="spec">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth="2">
                    <rect x="1" y="3" width="15" height="13"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
                  </svg>
                  <span className="sk">Reg. nr.</span>
                  <span className="sv">{car.reg_nr}</span>
                </div>
              </div>
              {car.beskrivelse && <p style={{ marginTop: 20, fontSize: 14.5, lineHeight: 1.7, color: 'var(--ink-2)' }}>{car.beskrivelse}</p>}
            </div>

            {/* Availability calendar */}
            <div className="card" style={{ marginTop: 20, padding: 24 }}>
              <h2 className="sub-head">Tilgængelighed</h2>
              <AvailabilityCalendar bookings={bookings} />
            </div>

            {/* Terms */}
            <div className="card" style={{ marginTop: 20, padding: 24 }}>
              <h2 className="sub-head">Lejevilkår</h2>
              <ul className="terms">
                <li>Minimum lejeperiode: 1 dag</li>
                <li>Depositum: {fmt(car.depositum)} reserveres på betalingskort ved afhentning og frigives ved afleveringen.</li>
                <li>Fri kørsel op til {car.km_per_dag} km/dag. Ekstra km faktureres til 3 kr./km.</li>
                <li>Bilen skal afleveres med samme brændstofniveau som ved afhentning.</li>
                <li>Rygning er ikke tilladt i bilen (rengøringsgebyr 1.500 kr.).</li>
                <li>Bilen må ikke føres uden for EU.</li>
                <li>Gratis afbestilling frem til 24 timer inden afhentning.</li>
              </ul>
            </div>
          </div>

          {/* Right: booking card */}
          <div>
            <div className="book-card card">
              <div className="bc-price">
                <span className="amt">{fmt(car.pris_dag)}</span>
                <span className="per">/ dag</span>
              </div>
              <div className="bc-fields">
                <div className="field">
                  <label>Afhentning</label>
                  <input className="input" type="datetime-local" defaultValue={fraParam} id="fra-input" />
                </div>
                <div className="field">
                  <label>Aflevering</label>
                  <input className="input" type="datetime-local" defaultValue={tilParam} id="til-input" />
                </div>
              </div>
              <Link href={`/booking/${car.id}?fra=${fraParam}&til=${tilParam}`} className="btn lg block">
                Book nu
              </Link>
              <div className="bc-note">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.4"><polyline points="20 6 9 17 4 12"/></svg>
                Gratis afbestilling · Depositum {fmt(car.depositum)}
              </div>
              <div className="bc-row"><span>Dagspris</span><span>{fmt(car.pris_dag)}</span></div>
              <div className="bc-row sub"><span>Forsikring inkluderet</span><span>✓</span></div>
            </div>
          </div>
        </div>
      </div>

      <SiteFooter />
    </>
  )
}
