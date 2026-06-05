'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'

interface Slide {
  src: string | null
  navn: string
}

interface Props {
  slides: Slide[]
}

export default function HeroSlideshow({ slides }: Props) {
  const [current, setCurrent] = useState(0)
  const [prev, setPrev] = useState<number | null>(null)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    if (slides.length <= 1) return
    const t = setInterval(() => {
      setPrev(c => c)
      setFading(true)
      setTimeout(() => {
        setCurrent(c => (c + 1) % slides.length)
        setFading(false)
        setPrev(null)
      }, 600)
    }, 4000)
    return () => clearInterval(t)
  }, [slides.length])

  const slide = slides[current]
  const prevSlide = prev !== null ? slides[prev] : null

  return (
    <div style={{ position: 'relative', width: '100%', height: 400, borderRadius: 'var(--r-xl)', overflow: 'hidden', background: 'var(--bg-2)' }}>
      {/* Forrige billede (fade ud) */}
      {prevSlide && (
        <div style={{ position: 'absolute', inset: 0, opacity: fading ? 0 : 1, transition: 'opacity 0.6s ease', zIndex: 1 }}>
          <SlideImg slide={prevSlide} />
        </div>
      )}

      {/* Nuværende billede (fade ind) */}
      <div style={{ position: 'absolute', inset: 0, opacity: fading ? 0 : 1, transition: 'opacity 0.6s ease', zIndex: 2 }}>
        <SlideImg slide={slide} />
      </div>

      {/* Dot-indikatorer */}
      {slides.length > 1 && (
        <div style={{ position: 'absolute', bottom: 14, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 6, zIndex: 10 }}>
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => { setPrev(current); setCurrent(i) }}
              style={{
                width: i === current ? 22 : 7,
                height: 7,
                borderRadius: 999,
                border: 'none',
                cursor: 'pointer',
                background: i === current ? '#fff' : 'rgba(255,255,255,.45)',
                transition: 'width .3s ease, background .3s ease',
                padding: 0,
              }}
            />
          ))}
        </div>
      )}

      {/* Float badges */}
      <div className="float-badge fb-1" style={{ zIndex: 10 }}>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--green-bg)', color: 'var(--green)', display: 'grid', placeItems: 'center' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><polyline points="20 6 9 17 4 12" /></svg>
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 13 }}>Gratis afbestilling</div>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>Op til 24 timer inden</div>
        </div>
      </div>
      <div className="float-badge fb-2" style={{ zIndex: 10 }}>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--blue-tint)', color: 'var(--blue)', display: 'grid', placeItems: 'center' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M12 2l8 3v7c0 5-8 10-8 10S4 17 4 12V5z" /></svg>
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 13 }}>Fuld forsikring</div>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>Inkluderet i prisen</div>
        </div>
      </div>
    </div>
  )
}

function SlideImg({ slide }: { slide: Slide }) {
  if (!slide.src) {
    return (
      <div style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center', background: 'var(--bg-2)', color: 'var(--faint)', fontSize: 13 }}>
        {slide.navn}
      </div>
    )
  }
  return (
    <Image
      src={slide.src}
      alt={slide.navn}
      fill
      style={{ objectFit: 'cover' }}
      priority
    />
  )
}
