import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

interface Ctx { params: Promise<{ id: string }> }

function getSupabase() {
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').trim()
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY ?? '').trim()
  if (!url || !key) return null
  return createClient(url, key, { auth: { persistSession: false } })
}

export async function POST(req: NextRequest, { params }: Ctx) {
  const { id } = await params

  const car = await db.car.findUnique({ where: { id } })
  if (!car) return NextResponse.json({ error: 'Bil ikke fundet' }, { status: 404 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'Ingen fil' }, { status: 400 })

  const supabase = getSupabase()

  if (!supabase) {
    const mockUrl = `https://placehold.co/800x500/e8edf5/1a2d4f?text=${encodeURIComponent(car.navn)}`
    const image = await db.carImage.create({
      data: { car_id: id, url: mockUrl, raekkefoelge: 0 },
    })
    return NextResponse.json(image, { status: 201 })
  }

  const bytes = await file.arrayBuffer()
  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
  const path = `cars/${id}/${Date.now()}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('car-images')
    .upload(path, Buffer.from(bytes), {
      contentType: file.type || 'image/jpeg',
      upsert: true,
    })

  if (uploadError) {
    return NextResponse.json({ error: `Upload fejlede: ${uploadError.message}` }, { status: 500 })
  }

  const { data: { publicUrl } } = supabase.storage
    .from('car-images')
    .getPublicUrl(path)

  const image = await db.carImage.create({
    data: { car_id: id, url: publicUrl, raekkefoelge: 0 },
  })

  return NextResponse.json(image, { status: 201 })
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  const { id } = await params
  const { imageId } = await req.json()

  const img = await db.carImage.findFirst({ where: { id: imageId, car_id: id } })
  if (img) {
    await db.carImage.delete({ where: { id: imageId } })

    const supabase = getSupabase()
    if (supabase && img.url.includes('supabase')) {
      const path = img.url.split('/car-images/')[1]
      if (path) await supabase.storage.from('car-images').remove([path])
    }
  }

  return NextResponse.json({ ok: true })
}
