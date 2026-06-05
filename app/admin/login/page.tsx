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
    if (!password.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (res.ok) {
        router.replace('/admin')
      } else {
        setError('Forkert adgangskode')
        setLoading(false)
      }
    } catch {
      setError('Netværksfejl – prøv igen')
      setLoading(false)
    }
  }

  return (
    <div className="login-wrap">
      <div className="login-card">
        <div className="brand" style={{ justifyContent: 'center', marginBottom: 28 }}>
          <span className="mark"></span>
          Lejebilen<span style={{ color: 'var(--blue)' }}>.nu</span>
        </div>
        <h1>Admin login</h1>
        <p>Ølstykke Auto administrationspanel</p>
        <form onSubmit={handleSubmit} style={{ marginTop: 28 }}>
          <div className="field">
            <label>Adgangskode</label>
            <input
              className="input"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              autoFocus
              autoComplete="current-password"
            />
          </div>
          {error && (
            <div style={{ color: 'var(--red)', fontSize: 13.5, marginTop: 10, fontWeight: 600 }}>
              {error}
            </div>
          )}
          <button
            className="btn lg block"
            type="submit"
            disabled={loading || !password.trim()}
            style={{ marginTop: 18 }}
          >
            {loading ? 'Logger ind…' : 'Log ind →'}
          </button>
        </form>
        <p style={{ marginTop: 24, fontSize: 13, color: 'var(--muted)', textAlign: 'center' }}>
          Ølstykke Auto · Stationsvej 12 · 3650 Ølstykke
        </p>
      </div>
    </div>
  )
}
