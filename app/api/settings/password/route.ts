export const dynamic = "force-dynamic"
import { z } from 'zod'
import { getSession, verifyPassword, hashPassword } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ok, err, unauthorized, serverError } from '@/lib/apiHelpers'

const PasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).regex(/[A-Z]/, 'Must include uppercase').regex(/[0-9]/, 'Must include number').regex(/[!@#$%^&*(),.?":{}|<>]/, 'Must include special character'),
})

export async function PATCH(req: Request) {
  try {
    const session = await getSession()
    if (!session) return unauthorized()
    const body = await req.json().catch(() => null)
    const parsed = PasswordSchema.safeParse(body)
    if (!parsed.success) return err(parsed.error.issues[0]?.message || 'Invalid password payload', 422)

    const user = await prisma.user.findUnique({ where: { id: session.userId }, select: { id: true, password: true } })
    if (!user) return unauthorized()

    const valid = await verifyPassword(parsed.data.currentPassword, user.password)
    if (!valid) return err('Current password is incorrect', 400)

    const newHash = await hashPassword(parsed.data.newPassword)
    await prisma.user.update({
      where: { id: session.userId },
      data: {
        password: newHash,
        sessionVersion: { increment: 1 },
      },
    })
    return ok({ message: 'Password updated successfully' })
  } catch (e) {
    return serverError(e)
  }
}
