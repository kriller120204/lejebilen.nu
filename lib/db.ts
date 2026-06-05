import { PrismaClient } from '@prisma/client'

function buildUrl() {
  const url = process.env.DATABASE_URL ?? ''
  if (!url) return url
  // Supabase kræver SSL fra serverless miljøer (Vercel)
  if (url.includes('supabase') && !url.includes('sslmode')) {
    return url + (url.includes('?') ? '&sslmode=require' : '?sslmode=require')
  }
  return url
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: { db: { url: buildUrl() } },
    log: process.env.NODE_ENV === 'development' ? ['error'] : [],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export const db = prisma

export default prisma
