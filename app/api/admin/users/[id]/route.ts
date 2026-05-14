export const dynamic = "force-dynamic"
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { ok, err, unauthorized, forbidden, notFound, serverError } from '@/lib/apiHelpers'
import { securityLog } from '@/lib/securityLogger'
import { extractIp } from '@/lib/rateLimit'

// DELETE /api/admin/users/[id] — Admin soft-deletes a user account
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session) return unauthorized()
    if (session.role !== 'ADMIN') return forbidden()

    const { id } = await params
    const ip = await extractIp()

    // Prevent admin from deleting themselves
    if (id === session.userId) {
      return err('You cannot delete your own admin account.', 400)
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, role: true, isActive: true, deletedAt: true }
    })

    if (!user) return notFound('User')

    if (user.deletedAt || !user.isActive) {
      return err('User account is already deactivated.', 400)
    }

    // Soft delete: mark as inactive and set deletedAt timestamp
    // This preserves order/payment history for auditing
    await prisma.user.update({
      where: { id },
      data: {
        isActive: false,
        deletedAt: new Date(),
        // Increment sessionVersion to invalidate all active sessions immediately
        sessionVersion: { increment: 1 },
      }
    })

    // Archive all of this user's published gigs
    await prisma.gig.updateMany({
      where: { sellerId: id, status: 'PUBLISHED' },
      data: { status: 'ARCHIVED' }
    })

    await securityLog({
      event: 'ADMIN_ACTION',
      action: 'USER_DELETED',
      userId: session.userId,
      targetId: id,
      ip,
      message: `Admin soft-deleted user: ${user.email} (${user.name})`
    })

    return ok({ message: `User ${user.name} (${user.email}) has been deactivated.` })
  } catch (e) {
    console.error('[Admin Delete User Error]', e)
    return serverError('Failed to delete user')
  }
}

// PATCH /api/admin/users/[id] — Admin reactivates a user account
export async function PATCH(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session) return unauthorized()
    if (session.role !== 'ADMIN') return forbidden()

    const { id } = await params
    const ip = await extractIp()

    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, isActive: true, deletedAt: true }
    })

    if (!user) return notFound('User')

    if (user.isActive && !user.deletedAt) {
      return err('User account is already active.', 400)
    }

    await prisma.user.update({
      where: { id },
      data: {
        isActive: true,
        deletedAt: null,
      }
    })

    await securityLog({
      event: 'ADMIN_ACTION',
      action: 'USER_REACTIVATED',
      userId: session.userId,
      targetId: id,
      ip,
      message: `Admin reactivated user: ${user.email} (${user.name})`
    })

    return ok({ message: `User ${user.name} (${user.email}) has been reactivated.` })
  } catch (e) {
    console.error('[Admin Reactivate User Error]', e)
    return serverError('Failed to reactivate user')
  }
}
