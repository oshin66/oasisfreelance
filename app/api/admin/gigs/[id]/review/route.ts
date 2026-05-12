export const dynamic = "force-dynamic"
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { ok, err, unauthorized, forbidden, notFound, serverError } from '@/lib/apiHelpers'
import { z } from 'zod'

const ReviewSchema = z.object({
  action: z.enum(['approve', 'reject']),
})

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session)                 return unauthorized()
    if (session.role !== 'ADMIN') return forbidden()

    const { id } = await params
    const gig = await prisma.gig.findUnique({ where: { id } })
    if (!gig) return notFound('Gig')

    if (gig.status !== 'PENDING_REVIEW') {
      return err(`Gig is not pending review (current status: ${gig.status})`, 400)
    }

    const body   = await req.json()
    const parsed = ReviewSchema.safeParse(body)
    if (!parsed.success) return err('Invalid action', 422)

    const { action } = parsed.data

    const updated = await prisma.gig.update({
      where: { id },
      data: {
        status: action === 'approve' ? 'PUBLISHED' : 'REJECTED',
      },
    })

    return ok({
      gig:     updated,
      message: action === 'approve'
        ? 'Gig approved and published.'
        : 'Gig rejected. Seller has been notified.',
    })
  } catch (e) {
    console.error(e)
    return serverError('Failed to review gig')
  }
}
