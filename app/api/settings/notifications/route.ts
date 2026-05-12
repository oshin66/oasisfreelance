export const dynamic = "force-dynamic"
import { z } from 'zod'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ok, err, unauthorized, serverError } from '@/lib/apiHelpers'

const Schema = z.object({
  emailNewOrder: z.boolean(),
  emailOrderUpdate: z.boolean(),
  emailPaymentVerified: z.boolean(),
  emailPromotional: z.boolean(),
  weeklyDigest: z.boolean(),
  inAppNotifications: z.boolean(),
})

export async function PATCH(req: Request) {
  try {
    const session = await getSession()
    if (!session) return unauthorized()
    const body = await req.json().catch(() => null)
    const parsed = Schema.safeParse(body)
    if (!parsed.success) return err('Invalid notifications payload', 422)

    const settings = await prisma.userSettings.upsert({
      where: { userId: session.userId },
      update: parsed.data,
      create: { userId: session.userId, ...parsed.data },
    })
    return ok({ settings })
  } catch (e) {
    return serverError(e)
  }
}
