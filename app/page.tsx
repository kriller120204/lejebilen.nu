import { db } from '@/lib/db'
import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'
import SearchBox from '@/components/SearchBox'
import CarGrid from '@/components/CarGrid'

export const dynamic = 'force-dynamic'

async function getCars() {
  return db.car.findMany({
    where: { status: { not: 'UDGAAET' } },
    orderBy: { pris_dag: 'asc' },
    include: { images: { take: 1 } },
  })
}

export default async function HomePage() {
  const cars = await getCars()

  return (
    <>
      <SiteHeader />

      {/* Hero */}
      <section className="hero">
        <div className="wrap">
          <h1>Lej bil i Ølstykke<br /><span>fra kun {Math.min(...cars.map(c => c.pris_dag))} kr./dag</span></h1>
          <p>Nem og hurtig biludlejning med digital kontrakt og MitID-underskrift.</p>
          <SearchBox />
        </div>
      </section>

      {/* Car grid */}
      <section id="biler" className="section cars">
        <div className="wrap">
          <div className="sec-head">
            <h2>Vores biler</h2>
            <p>Vælg blandt {cars.length} biler klar til afhentning i Ølstykke</p>
          </div>
          <CarGrid cars={cars} />
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="section hiw">
        <div className="wrap">
          <div className="sec-head">
            <h2>Sådan lejer du</h2>
            <p>Fra booking til aflevering på under 3 minutter</p>
          </div>
          <div className="steps">
            <div className="step">
              <div className="sn">1</div>
              <h3>Vælg bil & datoer</h3>
              <p>Find den bil der passer til dit behov og vælg afhentnings- og afleveringstidspunkt.</p>
            </div>
            <div className="step">
              <div className="sn">2</div>
              <h3>Udfyld & underskriv</h3>
              <p>Udfyld dine oplysninger, upload kørekort og underskriv kontrakten med MitID.</p>
            </div>
            <div className="step">
              <div className="sn">3</div>
              <h3>Betal & afhent</h3>
              <p>Betal sikkert med MobilePay eller kort via QuickPay og afhent bilen i Ølstykke.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="section feat">
        <div className="wrap">
          <div className="feat-grid">
            <div className="feat-card">
              <div className="fi">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2l8 3v7c0 5-8 10-8 10S4 17 4 12V5z"/>
                </svg>
              </div>
              <h3>Fuld forsikring inkluderet</h3>
              <p>Alle biler er forsikrede. Reducér selvrisikoen til 0 kr. med tillægsforsikring.</p>
            </div>
            <div className="feat-card">
              <div className="fi">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </div>
              <h3>Sikker digital signering</h3>
              <p>Underskriv kontrakten hjemmefra med MitID. Ingen papirer ved afhentning.</p>
            </div>
            <div className="feat-card">
              <div className="fi">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
              </div>
              <h3>Fleksibel afbestilling</h3>
              <p>Gratis afbestilling op til 24 timer inden afhentning. Ingen skjulte gebyrer.</p>
            </div>
            <div className="feat-card">
              <div className="fi">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <h3>Lokal og personlig service</h3>
              <p>Ølstykke Autos kendte værksted bag hver bil. Ring på 47 12 34 56.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-sect">
        <div className="wrap cta-in">
          <h2>Klar til at leje?</h2>
          <p>Bestil online nu – bilen er klar til afhentning hos Ølstykke Auto.</p>
          <a href="#biler" className="btn lg">Se alle biler</a>
        </div>
      </section>

      {/* Contact */}
      <section id="kontakt" className="section kontakt">
        <div className="wrap">
          <div className="sec-head"><h2>Kontakt os</h2></div>
          <div className="kontakt-grid">
            <div>
              <h3>Ølstykke Auto</h3>
              <p>Stationsvej 12<br />3650 Ølstykke</p>
              <p><a href="tel:+4547123456">47 12 34 56</a><br /><a href="mailto:leje@oelstykkeauto.dk">leje@oelstykkeauto.dk</a></p>
              <p className="muted">Man–Fre 08–17 · Lør 09–13</p>
            </div>
            <div className="kontakt-map">
              <div className="map-placeholder">📍 Ølstykke, 3650</div>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </>
  )
}
