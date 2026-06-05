'use client'
import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (res.ok) {
        router.push('/admin')
        router.refresh()
      } else {
        setError('Forkert adgangskode')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-box">
        <div className="login-brand">
          <span className="mark"></span>
          <span>Lejebilen<span style={{ color: 'var(--blue)' }}>.nu</span> Admin</span>
        </div>
        <h1>Log ind</h1>
        <p className="sub">Ølstykke Auto administrationspanel</p>
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Adgangskode</label>
            <input
              className="input"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              autoFocus
            />
          </div>
          {error && <div className="form-error">{error}</div>}
          <button className="btn lg block" type="submit" disabled={loading}>
            {loading ? 'Logger ind…' : 'Log ind'}
          </button>
        </form>
        <p style={{ marginTop: 24, fontSize: 13, color: 'var(--muted)', textAlign: 'center' }}>
          Ølstykke Auto · Stationsvej 12 · 3650 Ølstykke
        </p>
      </div>
    </div>
  )
}
