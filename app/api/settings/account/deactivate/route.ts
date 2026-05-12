export const dynamic = "force-dynamic"
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ok, unauthorized, forbidden, serverError } from '@/lib/apiHelpers'

export async function DELETE() {
  try {
    const session = await getSession()
    if (!session) return unauthorized()
    if (session.role === 'ADMIN') return forbidden('Admin accounts cannot be deactivated here')

    await prisma.user.update({
      where: { id: session.userId },
      data: { isActive: false },
    })

    return ok({ message: 'Account deactivated' })
  } catch (e) {
    return serverError(e)
  }
}
