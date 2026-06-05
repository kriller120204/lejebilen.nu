import { db } from '@/lib/db'
import { fmt } from '@/lib/utils'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

async function getStats() {
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)

  const [
    totalBookings,
    activeBookings,
    monthRevenue,
    lastMonthRevenue,
    totalCars,
    availableCars,
    recentBookings,
    fleetStatus,
  ] = await Promise.all([
    db.booking.count({ where: { status: { not: 'ANNULLERET' } } }),
    db.booking.count({ where: { status: { in: ['AKTIV', 'BEKRAEFTET', 'AFVENTER'] } } }),
    db.booking.aggregate({
      _sum: { total_pris: true },
      where: { oprettet: { gte: monthStart }, status: { not: 'ANNULLERET' } },
    }),
    db.booking.aggregate({
      _sum: { total_pris: true },
      where: { oprettet: { gte: lastMonthStart, lt: monthStart }, status: { not: 'ANNULLERET' } },
    }),
    db.car.count({ where: { status: { not: 'UDGAAET' } } }),
    db.car.count({ where: { status: 'LEDIG' } }),
    db.booking.findMany({
      take: 6,
      orderBy: { oprettet: 'desc' },
      where: { status: { not: 'ANNULLERET' } },
      include: {
        customer: { select: { navn: true } },
        car: { select: { navn: true } },
      },
    }),
    db.car.findMany({
      where: { status: { not: 'UDGAAET' } },
      select: { navn: true, reg_nr: true, status: true, pris_dag: true },
      orderBy: { navn: 'asc' },
      take: 6,
    }),
  ])

  const rev = monthRevenue._sum.total_pris ?? 0
  const lastRev = lastMonthRevenue._sum.total_pris ?? 0
  const revDelta = lastRev > 0 ? Math.round(((rev - lastRev) / lastRev) * 100) : null

  return {
    totalBookings, activeBookings, rev, revDelta,
    totalCars, availableCars,
    utilization: totalCars > 0 ? Math.round(((totalCars - availableCars) / totalCars) * 100) : 0,
    recentBookings, fleetStatus,
  }
}

const STATUS_LABEL: Record<string, string> = {
  AFVENTER: 'Afventer', BEKRAEFTET: 'Bekræftet', AKTIV: 'Aktiv',
  UDLEJET: 'Udlejet', AFSLUTTET: 'Afsluttet', ANNULLERET: 'Annulleret',
}
const STATUS_CLS: Record<string, string> = {
  AFVENTER: 'amber', BEKRAEFTET: 'blue', AKTIV: 'green',
  UDLEJET: 'blue', AFSLUTTET: 'gray', ANNULLERET: 'red',
}
const CAR_STATUS_CLS: Record<string, string> = {
  LEDIG: 'green', RESERVERET: 'amber', UDLEJET: 'blue', SERVICE: 'amber',
}
const CAR_STATUS_LBL: Record<string, string> = {
  LEDIG: 'Ledig', RESERVERET: 'Reserveret', UDLEJET: 'Udlejet', SERVICE: 'Service',
}

function initials(name: string) {
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
}

export default async function AdminDashboard() {
  const s = await getStats()

  return (
    <div>
      {/* ── Page header ─────────────────────────────────────────── */}
      <div className="page-head">
        <div>
          <h1>Dashboard</h1>
          <span className="sub">Overblik over Ølstykke Auto biludlejning</span>
        </div>
        <Link href="/admin/bookinger" className="btn sm">+ Ny booking</Link>
      </div>

      {/* ── KPI cards ───────────────────────────────────────────── */}
      <div className="kpi-grid">
        <div className="kpi">
          <div className="top">
            <div className="lbl">Aktive bookinger</div>
            <div className="ic" style={{ background: 'var(--blue-tint)', color: 'var(--blue)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
              </svg>
            </div>
          </div>
          <div className="val">{s.activeBookings}</div>
          <div className="delta up">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="18 15 12 9 6 15" /></svg>
            {s.totalBookings} bookinger i alt
          </div>
        </div>

        <div className="kpi">
          <div className="top">
            <div className="lbl">Omsætning (måneden)</div>
            <div className="ic" style={{ background: 'oklch(0.95 0.05 155)', color: 'oklch(0.42 0.12 155)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
          </div>
          <div className="val">{fmt(s.rev)}</div>
          {s.revDelta !== null && (
            <div className={`delta ${s.revDelta >= 0 ? 'up' : 'down'}`}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                {s.revDelta >= 0
                  ? <polyline points="18 15 12 9 6 15" />
                  : <polyline points="6 9 12 15 18 9" />}
              </svg>
              {Math.abs(s.revDelta)}% vs. sidste måned
            </div>
          )}
        </div>

        <div className="kpi">
          <div className="top">
            <div className="lbl">Biler tilgængelige</div>
            <div className="ic" style={{ background: 'var(--amber-bg)', color: 'oklch(0.48 0.11 70)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 17H3v-5l2-5h14l2 5v5h-2M5 17a2 2 0 1 0 4 0M15 17a2 2 0 1 0 4 0M9 17h6" />
              </svg>
            </div>
          </div>
          <div className="val">{s.availableCars}<span style={{ fontSize: 18, fontWeight: 500, color: 'var(--muted)' }}>/{s.totalCars}</span></div>
          <div className="delta up">Klar til afhentning</div>
        </div>

        <div className="kpi">
          <div className="top">
            <div className="lbl">Udnyttelsesgrad</div>
            <div className="ic" style={{ background: 'var(--blue-tint)', color: 'var(--blue)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 20V10M12 20V4M6 20v-6" />
              </svg>
            </div>
          </div>
          <div className="val">{s.utilization}%</div>
          <div className="delta up">Biler aktuelt udlejet</div>
        </div>
      </div>

      {/* ── Dash grid ───────────────────────────────────────────── */}
      <div className="dash-grid">
        {/* Recent bookings */}
        <div className="panel-card">
          <div className="ph-head">
            <h3>Seneste bookinger</h3>
            <Link href="/admin/bookinger" className="btn sm ghost">Se alle →</Link>
          </div>
          <div className="mini-list">
            {s.recentBookings.length === 0 && (
              <div style={{ padding: '28px 20px', color: 'var(--muted)', fontSize: 14, textAlign: 'center' }}>
                Ingen bookinger endnu
              </div>
            )}
            {s.recentBookings.map(b => (
              <div className="mini-row" key={b.id}>
                <div className="av">{initials(b.customer.navn)}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="nm">{b.customer.navn}</div>
                  <div className="meta">{b.car.navn}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                  <span className={`badge ${STATUS_CLS[b.status] ?? 'gray'}`}>
                    {STATUS_LABEL[b.status] ?? b.status}
                  </span>
                  <span className="when">{fmt(b.total_pris)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Fleet status */}
        <div className="panel-card">
          <div className="ph-head">
            <h3>Flåde-status</h3>
            <Link href="/admin/biler" className="btn sm ghost">Se alle →</Link>
          </div>
          <div className="mini-list">
            {s.fleetStatus.map(car => (
              <div className="fleet-row" key={car.reg_nr}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="fn">{car.navn}</div>
                  <div className="fr">{car.reg_nr}</div>
                </div>
                <span className={`badge ${CAR_STATUS_CLS[car.status] ?? 'gray'}`}>
                  {CAR_STATUS_LBL[car.status] ?? car.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
