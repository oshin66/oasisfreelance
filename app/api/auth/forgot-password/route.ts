import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ok, err, serverError } from '@/lib/apiHelpers'
import { rateLimit, extractIp } from '@/lib/rateLimit'
import { z } from 'zod'
import { randomUUID } from 'crypto'
import { sendTransactionalEmail } from '@/lib/email'

const ForgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = ForgotPasswordSchema.safeParse(body)
    if (!parsed.success) return err('Invalid email', 422)

    const { email } = parsed.data

    // Rate Limiting
    const ip = await extractIp()
    const limiter = await rateLimit('login', ip, req.nextUrl.pathname)
    if (!limiter.allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many requests. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(limiter.retryAfter) } }
      )
    }

    // Check if user exists
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      // For security reasons, don't reveal if user exists or not
      return ok({ message: 'If an account with that email exists, we have sent a reset link.' })
    }

    // Generate token
    const token = randomUUID().replace(/-/g, '')
    
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    // Store token in DB
    await prisma.passwordResetToken.create({
      data: {
        email,
        token,
        expiresAt,
      },
    })

    const appUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const resetUrl = `${appUrl.replace(/\/$/, '')}/reset-password?token=${token}`

    const emailResult = await sendTransactionalEmail({
      to: email,
      subject: 'Reset your Craftsmanship Oasis password',
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1a1916;">
          <h2 style="margin: 0 0 12px;">Password reset request</h2>
          <p>Click the button below to reset your password. This link expires in 1 hour.</p>
          <p style="margin: 20px 0;">
            <a href="${resetUrl}" style="display: inline-block; background: #1B3D2F; color: #F2F0EA; text-decoration: none; padding: 10px 16px;">Reset Password</a>
          </p>
          <p>If the button doesn't work, copy this URL into your browser:</p>
          <p>${resetUrl}</p>
          <p>If you did not request this, you can ignore this email.</p>
        </div>
      `,
      text: `Reset your password using this link (valid for 1 hour): ${resetUrl}`,
    })

    if (!emailResult.ok) {
      await prisma.passwordResetToken.delete({ where: { token } }).catch(() => {})
      console.error('[Forgot Password Email Error]', emailResult.error)
      return err('Unable to send reset email right now. Please try again shortly.', 503)
    }

    return ok({ message: 'If an account with that email exists, we have sent a reset link.' })
  } catch (e) {
    console.error('[Forgot Password Error]', e)
    return serverError('Failed to process forgot password request')
  }
}
