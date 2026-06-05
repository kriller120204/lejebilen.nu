import SiteHeader from '@/components/SiteHeader'

export default function CarLoading() {
  return (
    <>
      <SiteHeader />
      <div className="wrap det-wrap">
        <div className="breadcrumb">
          <div className="skel" style={{ width: 200, height: 13 }} />
        </div>
        <div className="det-layout">
          <div>
            <div className="skel" style={{ width: '100%', height: 380, borderRadius: 'var(--r-lg)' }} />
            <div className="thumbs" style={{ marginTop: 12 }}>
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="skel" style={{ width: '100%', aspectRatio: '4/3', borderRadius: 'var(--r)' }} />
              ))}
            </div>
          </div>
          <div>
            <div className="card" style={{ padding: 22 }}>
              <div className="skel" style={{ width: 200, height: 36, marginBottom: 16 }} />
              <div className="skel" style={{ width: '100%', height: 52 }} />
              <div className="skel" style={{ width: '100%', height: 52, marginTop: 14 }} />
              <div className="skel" style={{ width: '100%', height: 52, marginTop: 20 }} />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
