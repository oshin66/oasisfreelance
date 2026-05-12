export const dynamic = "force-dynamic"
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ok, unauthorized, forbidden, serverError } from '@/lib/apiHelpers'

export async function DELETE() {
  try {
    const session = await getSession()
    if (!session) return unauthorized()
    if (session.role === 'ADMIN') return forbidden('Admin accounts cannot be deleted here')

    const scheduled = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    await prisma.user.update({
      where: { id: session.userId },
      data: { deletedAt: scheduled },
    })

    return ok({ message: 'Account deletion scheduled', scheduledFor: scheduled.toISOString() })
  } catch (e) {
    return serverError(e)
  }
}
