import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'

const prisma = new PrismaClient()

async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString('hex')
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(password, salt, 310000, 64, 'sha256', (err: Error | null, derivedKey: Buffer) => {
      if (err) reject(err)
      resolve(`${salt}:${derivedKey.toString('hex')}`)
    })
  })
}

async function main() {
  console.log('🌱 Seeding...')

  const pass = await hashPassword('password123')

  const admin = await prisma.user.upsert({
    where: { email: 'admin@co.in' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@co.in',
      password: pass,
      role: 'ADMIN',
    },
  })

  const seller = await prisma.user.upsert({
    where: { email: 'seller@co.in' },
    update: {},
    create: {
      name: 'John Seller',
      email: 'seller@co.in',
      password: pass,
      role: 'SELLER',
      isSeller: true,
      sellerBio: 'Expert developer',
    },
  })

  const buyer = await prisma.user.upsert({
    where: { email: 'buyer@co.in' },
    update: {},
    create: {
      name: 'Jane Buyer',
      email: 'buyer@co.in',
      password: pass,
      role: 'BUYER',
    },
  })

  const gig = await prisma.gig.create({
    data: {
      sellerId: seller.id,
      title: 'Expert Next.js Development',
      description: 'I will build a high-quality Next.js application for you.',
      category: 'Web Development',
      techStack: 'Next.js,React,Tailwind',
      status: 'PUBLISHED',
      basicPrice: 5000,
      basicDesc: 'Simple landing page',
      standardPrice: 15000,
      standardDesc: 'Full web app',
      premiumPrice: 30000,
      premiumDesc: 'Enterprise solution',
    },
  })

  console.log('✅ Seed complete')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
