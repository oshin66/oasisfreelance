export const dynamic = "force-dynamic"
import { cookies } from 'next/headers'
import { verifyToken, signToken, setSessionCookie } from '@/lib/auth'
import { ok, unauthorized, serverError } from '@/lib/apiHelpers'
import { prisma } from '@/lib/prisma'

export async function POST() {
  try {
    const cookieStore = await cookies()
    const refreshToken = cookieStore.get('co_refresh')?.value
    if (!refreshToken) return unauthorized('No refresh token')

    const payload = await verifyToken(refreshToken)
    if (!payload || !payload.userId) return unauthorized('Invalid refresh token')

    // Verify user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        role: true,
        isSeller: true,
        isActive: true,
        deletedAt: true,
        sessionVersion: true,
      }
    })

    if (!user || !user.isActive || user.deletedAt) {
      return unauthorized('Account no longer active')
    }

    // Check session version matches (protects against stolen refresh tokens)
    if (payload.sessionVersion !== undefined && user.sessionVersion !== payload.sessionVersion) {
      return unauthorized('Session has been revoked')
    }

    // Issue new access token
    const newAccessToken = await signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      isSeller: user.isSeller,
      sessionVersion: user.sessionVersion,
    })

    // Set new session cookie
    const opts = setSessionCookie(newAccessToken)
    cookieStore.set(opts.name, opts.value, {
      httpOnly: opts.httpOnly,
      secure: opts.secure,
      sameSite: opts.sameSite,
      path: opts.path,
      maxAge: opts.maxAge,
    })

    return ok({ message: 'Token refreshed' })
  } catch (e) {
    console.error('[Token Refresh Error]', e)
    return serverError('Failed to refresh token')
  }
}
