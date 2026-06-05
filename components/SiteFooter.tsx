import Link from 'next/link'

export default function SiteFooter() {
  return (
    <footer className="site-foot">
      <div className="wrap">
        <div className="foot-grid">
          <div>
            <div className="brand">
              <span className="mark"></span>Lejebilen.nu
            </div>
            <p style={{ fontSize: 14, maxWidth: '26em' }}>
              Biludlejning hos Ølstykke Auto. Nem, sikker og professionel biludlejning til private og erhverv.
            </p>
            <div className="pay-row" style={{ marginTop: 18 }}>
              <span className="pay-chip">MobilePay</span>
              <span className="pay-chip">Visa</span>
              <span className="pay-chip">Mastercard</span>
              <span className="pay-chip">QuickPay</span>
            </div>
          </div>
          <div>
            <h4>Biler</h4>
            <ul>
              <li><Link href="/#biler">Lille bil</Link></li>
              <li><Link href="/#biler">Mellemklasse</Link></li>
              <li><Link href="/#biler">Stationcar</Link></li>
              <li><Link href="/#biler">Varebil</Link></li>
              <li><Link href="/#biler">Elbil</Link></li>
            </ul>
          </div>
          <div>
            <h4>Information</h4>
            <ul>
              <li><Link href="/#how">Sådan virker det</Link></li>
              <li><Link href="/#features">Forsikring</Link></li>
              <li><Link href="/#kontakt">Kontakt</Link></li>
              <li><Link href="/betingelser">Handelsbetingelser</Link></li>
            </ul>
          </div>
          <div>
            <h4>Ølstykke Auto</h4>
            <ul>
              <li>Stationsvej 12</li>
              <li>3650 Ølstykke</li>
              <li>47 12 34 56</li>
              <li>book@lejebilen.nu</li>
            </ul>
          </div>
        </div>
        <div className="foot-bot">
          <span>© {new Date().getFullYear()} Lejebilen.nu · CVR 12345678</span>
          <span className="row gap-16">
            <Link href="/betingelser">Handelsbetingelser</Link>
            <Link href="/privatlivspolitik">Privatlivspolitik</Link>
          </span>
        </div>
      </div>
    </footer>
  )
}
