'use client'
import { useState, useEffect, useRef } from 'react'
import { kategoriLabel } from '@/lib/utils'
import ImageSlot from './ImageSlot'

interface Car {
  id?: string
  navn: string
  reg_nr: string
  kategori: string
  gear: string
  braendstof: string
  saeder: number
  pris_dag: number
  depositum: number
  km_per_dag: number
  status: string
  beskrivelse?: string | null
  images?: Array<{ id: string; url: string }>
}

const EMPTY: Car = {
  navn: '', reg_nr: '', kategori: 'LILLE', gear: 'MANUEL', braendstof: 'BENZIN',
  saeder: 5, pris_dag: 299, depositum: 3000, km_per_dag: 300, status: 'LEDIG', beskrivelse: '',
}

interface Props {
  car: Car | null
  isNew: boolean
  onClose: () => void
  onSaved: () => void
}

export default function CarDrawer({ car, isNew, onClose, onSaved }: Props) {
  const [form, setForm] = useState<Car>(EMPTY)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setForm(car ?? EMPTY)
  }, [car])

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !form.id) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch(`/api/cars/${form.id}/images`, { method: 'POST', body: fd })
      if (!res.ok) throw new Error(await res.text())
      const img = await res.json()
      setForm(f => ({ ...f, images: [...(f.images ?? []), img] }))
    } catch (e) {
      alert('Billedupload fejlede: ' + (e instanceof Error ? e.message : e))
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  async function handleDeleteImage(imageId: string) {
    if (!form.id) return
    await fetch(`/api/cars/${form.id}/images`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageId }),
    })
    setForm(f => ({ ...f, images: (f.images ?? []).filter(i => i.id !== imageId) }))
  }

  function set(k: keyof Car, v: string | number) {
    setForm(f => ({ ...f, [k]: v }))
  }

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch(isNew ? '/api/cars' : `/api/cars/${form.id}`, {
        method: isNew ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error(await res.text())
      onSaved()
      onClose()
    } catch (e) {
      alert('Fejl ved gem: ' + (e instanceof Error ? e.message : e))
    } finally {
      setSaving(false)
    }
  }

  const open = car !== null || isNew

  return (
    <>
      <div className={`drawer-back ${open ? 'open' : ''}`} onClick={onClose} />
      <aside className={`drawer ${open ? 'open' : ''}`} style={{ width: 480 }}>
        <div className="dr-head">
          <h2 style={{ fontSize: 21 }}>{isNew ? 'Opret bil' : 'Rediger bil'}</h2>
          <button type="button" className="close-x" onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <div className="dr-body">
          <div className="col gap-20">
            <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="field" style={{ gridColumn: '1/-1' }}>
                <label>Bilnavn</label>
                <input className="input" value={form.navn} onChange={e => set('navn', e.target.value)} placeholder="VW Polo" />
              </div>
              <div className="field">
                <label>Registreringsnr.</label>
                <input className="input" value={form.reg_nr} onChange={e => set('reg_nr', e.target.value)} placeholder="AB 12 345" />
              </div>
              <div className="field">
                <label>Kategori</label>
                <select className="input" value={form.kategori} onChange={e => set('kategori', e.target.value)}>
                  {['LILLE','MELLEMKLASSE','STATIONCAR','VAREBIL','EL'].map(k => (
                    <option key={k} value={k}>{kategoriLabel(k)}</option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label>Gear</label>
                <select className="input" value={form.gear} onChange={e => set('gear', e.target.value)}>
                  <option value="MANUEL">Manuel</option>
                  <option value="AUTOMATIK">Automatik</option>
                </select>
              </div>
              <div className="field">
                <label>Brændstof</label>
                <select className="input" value={form.braendstof} onChange={e => set('braendstof', e.target.value)}>
                  <option value="BENZIN">Benzin</option>
                  <option value="DIESEL">Diesel</option>
                  <option value="HYBRID">Hybrid</option>
                  <option value="EL">El</option>
                </select>
              </div>
              <div className="field">
                <label>Sæder</label>
                <input className="input" type="number" value={form.saeder} onChange={e => set('saeder', +e.target.value)} min={1} max={9} />
              </div>
              <div className="field">
                <label>Pris pr. dag (kr.)</label>
                <input className="input" type="number" value={form.pris_dag} onChange={e => set('pris_dag', +e.target.value)} placeholder="299" />
              </div>
              <div className="field">
                <label>Depositum (kr.)</label>
                <input className="input" type="number" value={form.depositum} onChange={e => set('depositum', +e.target.value)} />
              </div>
              <div className="field" style={{ gridColumn: '1/-1' }}>
                <label>Beskrivelse</label>
                <textarea className="input" rows={3} value={form.beskrivelse ?? ''} onChange={e => set('beskrivelse', e.target.value)} placeholder="Kort beskrivelse af bilen…" />
              </div>
            </div>

            {/* Billeder — kun vist ved redigering (bil har et id) */}
            {form.id && (
              <div>
                <label style={{ fontWeight: 600, fontSize: 14, display: 'block', marginBottom: 10 }}>Billeder</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
                  {(form.images ?? []).map(img => (
                    <div key={img.id} style={{ position: 'relative', width: 90, height: 68 }}>
                      <ImageSlot src={img.url} placeholder="" style={{ width: 90, height: 68, borderRadius: 8 }} />
                      <button
                        onClick={() => handleDeleteImage(img.id)}
                        style={{ position: 'absolute', top: 3, right: 3, background: 'rgba(0,0,0,.55)', border: 'none', borderRadius: 4, color: '#fff', cursor: 'pointer', fontSize: 12, padding: '1px 5px' }}
                      >✕</button>
                    </div>
                  ))}
                  <label style={{ width: 90, height: 68, border: '2px dashed var(--border)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexDirection: 'column', gap: 4, fontSize: 11, color: 'var(--muted)' }}>
                    {uploading ? '…' : <>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
                      Tilføj
                    </>}
                    <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} disabled={uploading} />
                  </label>
                </div>
                <p style={{ fontSize: 12, color: 'var(--muted)' }}>JPG / PNG / WebP · Første billede bruges som forsidebillede</p>
              </div>
            )}
            {!form.id && isNew && (
              <p style={{ fontSize: 12.5, color: 'var(--muted)' }}>Gem bilen først, derefter kan du uploade billeder.</p>
            )}

            <div className="toggle-row">
              <div>
                <div style={{ fontWeight: 600, fontSize: 14.5 }}>Tilgængelig for booking</div>
                <div className="muted" style={{ fontSize: 13 }}>Slå fra for at markere bilen som utilgængelig</div>
              </div>
              <div
                className={`switch ${form.status !== 'SERVICE' ? 'on' : ''}`}
                onClick={() => set('status', form.status === 'SERVICE' ? 'LEDIG' : 'SERVICE')}
              >
                <span className="knob" />
              </div>
            </div>

            <div className="row gap-12">
              <button className="btn block" onClick={handleSave} disabled={saving}>
                {saving ? 'Gemmer…' : 'Gem bil'}
              </button>
              <button className="btn ghost" onClick={onClose}>Annullér</button>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
