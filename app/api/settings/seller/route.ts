export const dynamic = "force-dynamic"
import { z } from 'zod'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ok, err, unauthorized, forbidden, serverError } from '@/lib/apiHelpers'

const Schema = z.object({
  upiId: z.string().max(120).optional().or(z.literal('')),
  bankAccount: z.string().max(64).optional().or(z.literal('')),
  bankIfsc: z.string().max(32).optional().or(z.literal('')),
  bankHolder: z.string().max(120).optional().or(z.literal('')),
  vacationMode: z.boolean(),
  responseTime: z.enum(['1hr', '4hr', '24hr']),
})

export async function PATCH(req: Request) {
  try {
    const session = await getSession()
    if (!session) return unauthorized()
    if (!session.isSeller && session.role !== 'ADMIN') return forbidden('Seller account required')
    const body = await req.json().catch(() => null)
    const parsed = Schema.safeParse(body)
    if (!parsed.success) return err('Invalid seller settings payload', 422)

    const settings = await prisma.userSettings.upsert({
      where: { userId: session.userId },
      update: {
        upiId: parsed.data.upiId?.trim() || null,
        bankAccount: parsed.data.bankAccount?.trim() || null,
        bankIfsc: parsed.data.bankIfsc?.trim() || null,
        bankHolder: parsed.data.bankHolder?.trim() || null,
        vacationMode: parsed.data.vacationMode,
        responseTime: parsed.data.responseTime,
      },
      create: {
        userId: session.userId,
        upiId: parsed.data.upiId?.trim() || null,
        bankAccount: parsed.data.bankAccount?.trim() || null,
        bankIfsc: parsed.data.bankIfsc?.trim() || null,
        bankHolder: parsed.data.bankHolder?.trim() || null,
        vacationMode: parsed.data.vacationMode,
        responseTime: parsed.data.responseTime,
      },
    })
    return ok({ settings })
  } catch (e) {
    return serverError(e)
  }
}
