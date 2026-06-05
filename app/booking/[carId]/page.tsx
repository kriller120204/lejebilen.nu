import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import BookingFlow from '@/components/BookingFlow'

interface Props {
  params: Promise<{ carId: string }>
  searchParams: Promise<{ fra?: string; til?: string }>
}

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: Props) {
  const { carId } = await params
  const car = await db.car.findUnique({ where: { id: carId } })
  if (!car) return {}
  return { title: `Book ${car.navn} – Lejebilen.nu` }
}

export default async function BookingPage({ params, searchParams }: Props) {
  const { carId } = await params
  const { fra, til } = await searchParams

  const car = await db.car.findUnique({
    where: { id: carId },
    include: { images: { take: 1 } },
  })

  if (!car) notFound()

  return (
    <BookingFlow
      car={{
        id: car.id,
        navn: car.navn,
        kategori: car.kategori,
        reg_nr: car.reg_nr,
        pris_dag: car.pris_dag,
        depositum: car.depositum,
        images: car.images.map(img => ({ url: img.url })),
      }}
      defaultFra={fra}
      defaultTil={til}
    />
  )
}
