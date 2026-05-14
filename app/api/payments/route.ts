export const dynamic = "force-dynamic"
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { ok, err, unauthorized, forbidden, notFound, serverError, tooManyRequests } from '@/lib/apiHelpers'
import { rateLimit, extractIp } from '@/lib/rateLimit'
import { sanitizeTransactionId } from '@/lib/sanitize'
import { securityLog } from '@/lib/securityLogger'
import { z } from 'zod'

const PaymentSchema = z.object({
  orderId:       z.string().cuid(),
  transactionId: z.string().min(5).max(100),
  screenshot:    z.string().optional(),
}).strict()

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return unauthorized()

    const ip = await extractIp()
    const limiterKey = `${ip}:${session.userId}`
    
    // Strict payments rate limiter (3 req / 5 min)
    const rl = await rateLimit('payments', limiterKey, req.nextUrl.pathname)
    if (!rl.allowed) return tooManyRequests(rl.retryAfter)

    const body = await req.json().catch(() => null)
    if (!body) return err('Invalid JSON body', 400)

    const parsed = PaymentSchema.safeParse(body)
    if (!parsed.success) return err(parsed.error.issues[0].message, 422)

    const { orderId, transactionId, screenshot } = parsed.data

    const safeTxnId = sanitizeTransactionId(transactionId)

    // Double Spend / Idempotency Architecture
    const existingTxn = await prisma.payment.findFirst({
      where: { transactionId: safeTxnId }
    })
    
    if (existingTxn) {
      await securityLog({ event: 'PAYMENT_SUBMISSION', message: 'Double-spend attempt blocked', userId: session.userId, txnId: safeTxnId, ip })
      return err('This Transaction ID has already been used. Contact support if this is an error.', 400)
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } })
    if (!order) return notFound('Order')

    // Use the order's price from the database (prevents client-side price manipulation)
    const amount = order.price

    // 1. Strict Ownership checking
    if (order.buyerId !== session.userId) {
      await securityLog({ event: 'UNAUTHORIZED_ACCESS', message: 'Attempt to pay for unowned order', userId: session.userId, targetId: orderId, ip })
      return forbidden()
    }

    // 2. Strict State Machine Checking
    if (order.status !== 'PENDING_PAYMENT') {
      return err('Order is not in PENDING_PAYMENT state. Action rejected.', 400)
    }

    // 3. Atomic Database Transaction (Ensures no desync between payment table and order table)
    const result = await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          amount,
          transactionId: safeTxnId,
          screenshot,
          status: 'PENDING',
          orderId
        }
      })

      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: { status: 'PAYMENT_VERIFICATION' }
      })

      return { payment, updatedOrder }
    })

    await securityLog({ event: 'PAYMENT_SUBMISSION', message: 'Payment submitted for verification', userId: session.userId, targetId: orderId, txnId: safeTxnId, ip })

    return ok({ payment: result.payment, message: 'Payment submitted for verification' })
  } catch (e) {
    console.error(e)
    return serverError('Failed to process payment')
  }
}
