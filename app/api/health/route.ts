import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  const checks: Record<string, string> = {}

  checks.DATABASE_URL = process.env.DATABASE_URL
    ? process.env.DATABASE_URL.replace(/:([^:@]+)@/, ':***@')
    : 'MANGLER'

  try {
    await db.$queryRaw`SELECT 1`
    checks.database = 'OK'
  } catch (e) {
    checks.database = 'FEJL: ' + (e instanceof Error ? e.message : String(e))
  }

  try {
    const count = await db.car.count()
    checks.cars = `${count} biler i DB`
  } catch (e) {
    checks.cars = 'FEJL: ' + (e instanceof Error ? e.message : String(e))
  }

  try {
    const cars = await db.car.findMany({ take: 1, select: { id: true, navn: true, status: true } })
    checks.cars_query = JSON.stringify(cars)
  } catch (e) {
    checks.cars_query = 'FEJL: ' + (e instanceof Error ? e.message : String(e))
  }

  return NextResponse.json(checks)
}
