export const dynamic = "force-dynamic"
import { z } from 'zod'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { verifyEmailOtp } from '@/lib/settingsOtpStore'
import { ok, err, unauthorized, serverError } from '@/lib/apiHelpers'

const VerifySchema = z.object({
  newEmail: z.string().email().max(255),
  otp: z.string().length(6),
})

export async function PATCH(req: Request) {
  try {
    const session = await getSession()
    if (!session) return unauthorized()
    const body = await req.json().catch(() => null)
    const parsed = VerifySchema.safeParse(body)
    if (!parsed.success) return err('Invalid verification payload', 422)

    const newEmail = parsed.data.newEmail.trim().toLowerCase()
    const valid = verifyEmailOtp(`${session.userId}:${newEmail}`, parsed.data.otp)
    if (!valid) return err('Invalid or expired OTP', 400)

    const exists = await prisma.user.findUnique({ where: { email: newEmail }, select: { id: true } })
    if (exists) return err('Email is already in use', 409)

    await prisma.user.update({
      where: { id: session.userId },
      data: { email: newEmail },
    })

    return ok({ message: 'Email updated successfully' })
  } catch (e) {
    return serverError(e)
  }
}
