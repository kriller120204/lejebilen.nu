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

  return NextResponse.json(checks)
}
