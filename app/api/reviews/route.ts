import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { ok, err, unauthorized, notFound, serverError } from '@/lib/apiHelpers'

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return unauthorized()

    const { orderId, rating, comment } = await req.json()
    if (!orderId || !rating) return err('Missing fields', 400)

    const order = await prisma.order.findUnique({
      where: { id: orderId }
    })

    if (!order) return notFound('Order')
    if (order.buyerId !== session.userId) return unauthorized()

    const review = await prisma.$transaction(async (tx) => {
      const r = await tx.review.create({
        data: {
          rating,
          comment,
          orderId,
          gigId: order.gigId,
          authorId: session.userId,
        }
      })

      // Update gig rating (average)
      const reviews = await tx.review.findMany({
        where: { gigId: order.gigId },
        select: { rating: true }
      })
      const avg = reviews.reduce((s, x) => s + x.rating, 0) / reviews.length

      await tx.gig.update({
        where: { id: order.gigId },
        data: { rating: avg }
      })

      return r
    })

    return ok({ review }, 201)
  } catch (e) {
    console.error(e)
    return serverError('Failed to post review')
  }
}
