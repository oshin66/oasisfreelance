export const dynamic = "force-dynamic"
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ok, forbidden, unauthorized, serverError } from '@/lib/apiHelpers'
import { NextResponse } from 'next/server'

// GET /api/users — admin only: list all users
export async function GET() {
  try {
    const session = await getSession()
    if (!session) return unauthorized()
    if (session.role !== 'ADMIN') return forbidden()

    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, isSeller: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    })

    return ok({ users })
  } catch (e) {
    return serverError(e)
  }
}

// DELETE /api/users — self-service hard delete for buyer/seller
export async function DELETE() {
  try {
    const session = await getSession()
    if (!session) return unauthorized()
    if (session.role === 'ADMIN') return forbidden('Admin accounts cannot be deleted from this endpoint')

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { id: true, email: true },
    })
    if (!user) return unauthorized('User no longer exists')

    await prisma.$transaction(async (tx) => {
      const sellerGigIds = (await tx.gig.findMany({
        where: { sellerId: user.id },
        select: { id: true },
      })).map((g) => g.id)

      const directOrders = await tx.order.findMany({
        where: {
          OR: [
            { buyerId: user.id },
            { sellerId: user.id },
            ...(sellerGigIds.length ? [{ gigId: { in: sellerGigIds } }] : []),
          ],
        },
        select: { id: true },
      })
      const orderIds = directOrders.map((o) => o.id)

      const paymentRows = orderIds.length
        ? await tx.payment.findMany({
            where: { orderId: { in: orderIds } },
            select: { id: true },
          })
        : []
      const paymentIds = paymentRows.map((p) => p.id)

      await tx.review.deleteMany({
        where: {
          OR: [
            { authorId: user.id },
            ...(orderIds.length ? [{ orderId: { in: orderIds } }] : []),
            ...(sellerGigIds.length ? [{ gigId: { in: sellerGigIds } }] : []),
          ],
        },
      })

      if (paymentIds.length) {
        await tx.paymentLog.deleteMany({
          where: { paymentId: { in: paymentIds } },
        })
      }

      if (orderIds.length) {
        await tx.payment.deleteMany({
          where: { orderId: { in: orderIds } },
        })
      }

      if (orderIds.length) {
        await tx.order.deleteMany({
          where: { id: { in: orderIds } },
        })
      }

      await tx.gig.deleteMany({
        where: { sellerId: user.id },
      })

      await tx.otpVerification.deleteMany({
        where: { email: user.email },
      })
      await tx.passwordResetToken.deleteMany({
        where: { email: user.email },
      })

      await tx.user.delete({
        where: { id: user.id },
      })
    })

    const response = NextResponse.json({ success: true, message: 'Account deleted permanently' })
    response.cookies.set({
      name: 'co_session',
      value: '',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    })
    response.cookies.set({
      name: 'co_refresh',
      value: '',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    })
    return response
  } catch (e) {
    return serverError(e)
  }
}
