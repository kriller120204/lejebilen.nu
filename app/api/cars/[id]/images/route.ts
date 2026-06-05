import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

interface Ctx { params: Promise<{ id: string }> }

export async function POST(req: NextRequest, { params }: Ctx) {
  const { id } = await params

  const car = await db.car.findUnique({ where: { id } })
  if (!car) return NextResponse.json({ error: 'Bil ikke fundet' }, { status: 404 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'Ingen fil' }, { status: 400 })

  // Upload til Supabase Storage
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    // Mock: gem dummy URL til lokal udvikling
    const mockUrl = `https://placehold.co/800x500/e8edf5/1a2d4f?text=${encodeURIComponent(car.navn)}`
    const image = await db.carImage.create({
      data: { car_id: id, url: mockUrl, raekkefoelge: 0 },
    })
    return NextResponse.json(image, { status: 201 })
  }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  const ext = file.name.split('.').pop() ?? 'jpg'
  const path = `cars/${id}/${Date.now()}.${ext}`

  const uploadRes = await fetch(
    `${supabaseUrl}/storage/v1/object/car-images/${path}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${supabaseKey}`,
        'Content-Type': file.type,
        'x-upsert': 'true',
      },
      body: buffer,
    },
  )

  if (!uploadRes.ok) {
    const err = await uploadRes.text()
    return NextResponse.json({ error: `Upload fejlede: ${err}` }, { status: 500 })
  }

  const url = `${supabaseUrl}/storage/v1/object/public/car-images/${path}`
  const image = await db.carImage.create({
    data: { car_id: id, url, raekkefoelge: 0 },
  })

  return NextResponse.json(image, { status: 201 })
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  const { id } = await params
  const { imageId } = await req.json()
  await db.carImage.deleteMany({ where: { id: imageId, car_id: id } })
  return NextResponse.json({ ok: true })
}
