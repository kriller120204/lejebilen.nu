import { db } from '@/lib/db'
import { fmt } from '@/lib/utils'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

async function getStats() {
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  const [
    totalBookings,
    activeBookings,
    monthRevenue,
    totalCars,
    availableCars,
    recentBookings,
  ] = await Promise.all([
    db.booking.count({ where: { status: { not: 'ANNULLERET' } } }),
    db.booking.count({ where: { status: 'AKTIV' } }),
    db.booking.aggregate({
      _sum: { total_pris: true },
      where: { oprettet: { gte: monthStart }, status: { not: 'ANNULLERET' } },
    }),
    db.car.count({ where: { status: { not: 'UDGAAET' } } }),
    db.car.count({ where: { status: 'LEDIG' } }),
    db.booking.findMany({
      take: 8,
      orderBy: { oprettet: 'desc' },
      where: { status: { not: 'ANNULLERET' } },
      include: {
        customer: { select: { navn: true } },
        car: { select: { navn: true } },
      },
    }),
  ])

  return {
    totalBookings,
    activeBookings,
    monthRevenue: monthRevenue._sum.total_pris ?? 0,
    totalCars,
    availableCars,
    recentBookings,
  }
}

const STATUS_LABEL: Record<string, string> = {
  AFVENTER: 'Afventer',
  BEKRAEFTET: 'Bekræftet',
  AKTIV: 'Aktiv',
  UDLEJET: 'Udlejet',
  AFSLUTTET: 'Afsluttet',
  ANNULLERET: 'Annulleret',
}
const STATUS_CLASS: Record<string, string> = {
  AFVENTER: 'amber',
  BEKRAEFTET: 'blue',
  AKTIV: 'green',
  UDLEJET: 'blue',
  AFSLUTTET: 'gray',
  ANNULLERET: 'red',
}

export default async function AdminDashboard() {
  const stats = await getStats()

  return (
    <div>
      <div className="page-head">
        <h1>Dashboard</h1>
        <p className="sub">Overblik over Ølstykke Auto biludlejning</p>
      </div>

      {/* KPI cards */}
      <div className="kpi-grid">
        <div className="kpi">
          <div className="kl">Aktive bookinger</div>
          <div className="kv tnum">{stats.activeBookings}</div>
          <div className="ks">{stats.totalBookings} i alt</div>
        </div>
        <div className="kpi">
          <div className="kl">Omsætning (måneden)</div>
          <div className="kv tnum">{fmt(stats.monthRevenue)}</div>
          <div className="ks">Ekskl. annullerede</div>
        </div>
        <div className="kpi">
          <div className="kl">Biler tilgængelige</div>
          <div className="kv tnum">{stats.availableCars}<span style={{ fontSize: 20 }}>/{stats.totalCars}</span></div>
          <div className="ks">Klar til afhentning</div>
        </div>
        <div className="kpi">
          <div className="kl">Udnyttelsesgrad</div>
          <div className="kv tnum">
            {stats.totalCars > 0 ? Math.round(((stats.totalCars - stats.availableCars) / stats.totalCars) * 100) : 0}%
          </div>
          <div className="ks">Biler aktuelle udlejet</div>
        </div>
      </div>

      {/* Recent bookings */}
      <div className="card" style={{ marginTop: 28 }}>
        <div className="table-head" style={{ padding: '20px 24px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: 17, fontFamily: 'var(--display)' }}>Seneste bookinger</h2>
          <Link href="/admin/bookinger" className="btn sm ghost">Se alle →</Link>
        </div>
        <div className="table-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th>Booking nr.</th>
                <th>Kunde</th>
                <th>Bil</th>
                <th>Status</th>
                <th>Beløb</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentBookings.map(b => (
                <tr key={b.id}>
                  <td className="mono">{b.booking_nr}</td>
                  <td>{b.customer.navn}</td>
                  <td>{b.car.navn}</td>
                  <td>
                    <span className={`badge ${STATUS_CLASS[b.status] ?? 'gray'}`}>
                      {STATUS_LABEL[b.status] ?? b.status}
                    </span>
                  </td>
                  <td className="tnum">{fmt(b.total_pris)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
