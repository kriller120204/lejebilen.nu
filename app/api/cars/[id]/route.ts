import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

interface Ctx { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { id } = await params
  const car = await db.car.findUnique({ where: { id }, include: { images: true } })
  if (!car) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(car)
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  const { id } = await params
  try {
    const body = await req.json()
    const car = await db.car.update({ where: { id }, data: body })
    return NextResponse.json(car)
  } catch {
    return NextResponse.json({ error: 'Update failed' }, { status: 400 })
  }
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { id } = await params
  await db.car.update({ where: { id }, data: { status: 'UDGAAET' } })
  return NextResponse.json({ ok: true })
}
