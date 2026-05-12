export const dynamic = "force-dynamic"
import { z } from 'zod'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ok, err, unauthorized, serverError } from '@/lib/apiHelpers'

const ProfileSchema = z.object({
  name: z.string().min(2).max(100),
  avatar: z.string().nullable().optional(),
  college: z.string().max(120).nullable().optional(),
  bio: z.string().max(1200).nullable().optional(),
  skills: z.array(z.string().min(1).max(40)).max(30),
  githubUrl: z.string().url().nullable().optional().or(z.literal('')),
  linkedinUrl: z.string().url().nullable().optional().or(z.literal('')),
})

export async function PATCH(req: Request) {
  try {
    const session = await getSession()
    if (!session) return unauthorized()
    const body = await req.json().catch(() => null)
    const parsed = ProfileSchema.safeParse(body)
    if (!parsed.success) return err(parsed.error.issues[0]?.message || 'Invalid profile payload', 422)

    const payload = parsed.data
    const user = await prisma.user.update({
      where: { id: session.userId },
      data: {
        name: payload.name.trim(),
        avatar: payload.avatar ?? null,
        college: payload.college?.trim() || null,
        sellerBio: payload.bio?.trim() || null,
        skills: payload.skills.join(','),
        githubUrl: payload.githubUrl?.trim() || null,
        linkedinUrl: payload.linkedinUrl?.trim() || null,
      },
      select: {
        id: true, name: true, email: true, avatar: true, college: true, sellerBio: true, skills: true, githubUrl: true, linkedinUrl: true,
      },
    })
    return ok({ user })
  } catch (e) {
    return serverError(e)
  }
}
