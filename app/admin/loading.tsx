export default function AdminLoading() {
  return (
    <div>
      <div className="page-head">
        <div>
          <div className="skel" style={{ width: 140, height: 28 }} />
          <div className="skel" style={{ width: 220, height: 14, marginTop: 8 }} />
        </div>
      </div>
      <div className="kpi-grid">
        {[1, 2, 3, 4].map(i => (
          <div className="kpi" key={i}>
            <div className="top">
              <div className="skel" style={{ width: 120, height: 13 }} />
              <div className="skel" style={{ width: 40, height: 40, borderRadius: 10 }} />
            </div>
            <div className="skel" style={{ width: 80, height: 36, marginTop: 14 }} />
            <div className="skel" style={{ width: 100, height: 12, marginTop: 10 }} />
          </div>
        ))}
      </div>
      <div className="dash-grid" style={{ marginTop: 24 }}>
        {[1, 2].map(i => (
          <div className="panel-card" key={i}>
            <div className="ph-head">
              <div className="skel" style={{ width: 160, height: 17 }} />
            </div>
            {[1, 2, 3, 4].map(j => (
              <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '13px 20px', borderBottom: '1px solid var(--line)' }}>
                <div className="skel" style={{ width: 38, height: 38, borderRadius: 9, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div className="skel" style={{ width: '60%', height: 14 }} />
                  <div className="skel" style={{ width: '40%', height: 12, marginTop: 6 }} />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
