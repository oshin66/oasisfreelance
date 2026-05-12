export const dynamic = "force-dynamic"
import { z } from 'zod'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { setEmailOtp } from '@/lib/settingsOtpStore'
import { ok, err, unauthorized, serverError } from '@/lib/apiHelpers'

const RequestSchema = z.object({
  newEmail: z.string().email().max(255),
})

export async function PATCH(req: Request) {
  try {
    const session = await getSession()
    if (!session) return unauthorized()
    const body = await req.json().catch(() => null)
    const parsed = RequestSchema.safeParse(body)
    if (!parsed.success) return err('Invalid email', 422)

    const newEmail = parsed.data.newEmail.trim().toLowerCase()
    if (newEmail === session.email.toLowerCase()) return err('New email must be different', 400)

    const exists = await prisma.user.findUnique({ where: { email: newEmail }, select: { id: true } })
    if (exists) return err('Email is already in use', 409)

    const otp = `${Math.floor(100000 + Math.random() * 900000)}`
    setEmailOtp(`${session.userId}:${newEmail}`, otp)

    // Mock transport: console log OTP for now.
    console.log(`[SETTINGS OTP] user=${session.userId} newEmail=${newEmail} otp=${otp}`)
    return ok({ message: 'OTP sent to new email address' })
  } catch (e) {
    return serverError(e)
  }
}
