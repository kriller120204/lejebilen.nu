import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Lejebilen.nu – Ølstykke Auto',
  description: 'Lej bil i Ølstykke. Fleksibel biludlejning med digital booking og MitID-underskrift.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="da">
      <body>{children}</body>
    </html>
  )
}
