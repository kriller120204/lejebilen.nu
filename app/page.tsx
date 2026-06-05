import { db } from '@/lib/db'
import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'
import SearchBox from '@/components/SearchBox'
import CarGrid from '@/components/CarGrid'
import HeroSlideshow from '@/components/HeroSlideshow'

export const dynamic = 'force-dynamic'

async function getCars() {
  return db.car.findMany({
    where: { status: { in: ['LEDIG', 'RESERVERET', 'UDLEJET', 'SERVICE'] } },
    orderBy: { pris_dag: 'asc' },
    include: { images: { take: 1 } },
  })
}

export default async function HomePage() {
  const cars = await getCars()
  const slides: { src: string | null; navn: string }[] = cars
    .filter(c => c.images?.[0]?.url)
    .map(c => ({ src: c.images![0].url, navn: c.navn }))
  if (slides.length === 0) slides.push({ src: null, navn: 'Lejebil fra Ølstykke Auto' })
  const minPrice = cars.length > 0 ? Math.min(...cars.map(c => c.pris_dag)) : 399

  return (
    <>
      <SiteHeader />

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="hero">
        <div className="wrap">
          <div className="hero-grid">
            <div>
              <p className="eyebrow">Ølstykke Auto · Biludlejning</p>
              <h1>Lej bil i <span className="accent">Ølstykke</span><br />fra kun {minPrice} kr./dag</h1>
              <p className="lead">Nem og hurtig biludlejning med digital kontrakt og MitID-underskrift.</p>
              <div className="hero-trust">
                <span className="chip">✓ Gratis afbestilling</span>
                <span className="chip">✓ MitID-signering</span>
                <span className="chip">✓ Forsikring inkl.</span>
                <span className="chip">✓ Klar samme dag</span>
              </div>
            </div>
            <div className="hero-img">
              <HeroSlideshow slides={slides} />
            </div>
          </div>
          <SearchBox />
        </div>
      </section>

      {/* ── Biler ────────────────────────────────────────────────── */}
      <section id="biler">
        <div className="wrap">
          <div className="sec-head" style={{ marginBottom: 28 }}>
            <div>
              <p className="eyebrow">Vores flåde</p>
              <h2>Vores biler</h2>
            </div>
            <p>Vælg blandt {cars.length} biler klar til afhentning i Ølstykke</p>
          </div>
          <CarGrid cars={cars} />
        </div>
      </section>

      {/* ── Sådan lejer du ───────────────────────────────────────── */}
      <section id="how" className="how">
        <div className="wrap">
          <div className="sec-head" style={{ marginBottom: 40 }}>
            <div>
              <p className="eyebrow light">Processen</p>
              <h2>Sådan lejer du</h2>
            </div>
            <p>Fra booking til aflevering på under 3 minutter</p>
          </div>
          <div className="steps">
            <div className="step">
              <div className="n">01 —</div>
              <h3>Vælg bil & datoer</h3>
              <p>Find den bil der passer til dit behov og vælg afhentnings- og afleveringstidspunkt.</p>
            </div>
            <div className="step">
              <div className="n">02 —</div>
              <h3>Udfyld & underskriv</h3>
              <p>Udfyld dine oplysninger, upload kørekort og underskriv kontrakten med MitID.</p>
            </div>
            <div className="step">
              <div className="n">03 —</div>
              <h3>Betal & afhent</h3>
              <p>Betal sikkert med MobilePay eller kort via QuickPay og afhent bilen i Ølstykke.</p>
            </div>
            <div className="step">
              <div className="n">04 —</div>
              <h3>Aflever & færdig</h3>
              <p>Aflever bilen til aftalt tid. Depositum frigives samme dag ved godkendt afleveringssyn.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Fordele ──────────────────────────────────────────────── */}
      <section id="features">
        <div className="wrap">
          <div className="sec-head" style={{ marginBottom: 28 }}>
            <div>
              <p className="eyebrow">Fordele</p>
              <h2>Hvorfor vælge os?</h2>
            </div>
          </div>
          <div className="feat-grid">
            <div className="feat">
              <div className="ico">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2l8 3v7c0 5-8 10-8 10S4 17 4 12V5z" />
                </svg>
              </div>
              <h3>Fuld forsikring inkluderet</h3>
              <p>Alle biler er forsikrede. Reducér selvrisikoen til 0 kr. med tillægsforsikring.</p>
            </div>
            <div className="feat">
              <div className="ico">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <h3>Sikker digital signering</h3>
              <p>Underskriv kontrakten hjemmefra med MitID. Ingen papirer ved afhentning.</p>
            </div>
            <div className="feat">
              <div className="ico">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <h3>Fleksibel afbestilling</h3>
              <p>Gratis afbestilling op til 24 timer inden afhentning. Ingen skjulte gebyrer.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────── */}
      <section>
        <div className="wrap">
          <div className="cta-band">
            <div>
              <h2>Klar til at leje?</h2>
              <p>Bestil online nu – bilen er klar til afhentning hos Ølstykke Auto.</p>
            </div>
            <a href="#biler" className="btn lg outline-w">Se alle biler →</a>
          </div>
        </div>
      </section>

      {/* ── Kontakt ──────────────────────────────────────────────── */}
      <section id="kontakt">
        <div className="wrap">
          <div className="sec-head" style={{ marginBottom: 36 }}>
            <div>
              <p className="eyebrow">Find os</p>
              <h2>Kontakt os</h2>
            </div>
          </div>
          <div className="kontakt-grid">
            <div>
              <h3>Ølstykke Auto</h3>
              <p>Stationsvej 12<br />3650 Ølstykke</p>
              <p style={{ marginTop: 12 }}>
                <a href="tel:+4547123456" style={{ color: 'var(--blue)', fontWeight: 600 }}>47 12 34 56</a><br />
                <a href="mailto:leje@oelstykkeauto.dk" style={{ color: 'var(--blue)' }}>leje@oelstykkeauto.dk</a>
              </p>
              <p className="muted" style={{ marginTop: 12 }}>Man–Fre 08–17 · Lør 09–13</p>
            </div>
            <div className="kontakt-map">
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 36, marginBottom: 10 }}>📍</div>
                <div style={{ fontWeight: 700, fontSize: 16 }}>Ølstykke, 3650</div>
                <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>Stationsvej 12</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </>
  )
}
