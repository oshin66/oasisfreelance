import { Resend } from 'resend'

interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

export async function sendTransactionalEmail({ to, subject, html, text }: EmailOptions) {
  try {
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      console.warn('[EMAIL] RESEND_API_KEY not set — email not sent to:', to)
      return { ok: false, error: 'Email service not configured' }
    }

    // Lazy initialization — avoids "Missing API key" crash at build time
    const resend = new Resend(apiKey)
    const from = process.env.EMAIL_FROM || 'Craftsmanship Oasis <onboarding@resend.dev>'
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      html,
      text: text || '',
    })

    if (error) {
      console.error('[EMAIL ERROR]', error)
      return { ok: false, error }
    }

    return { ok: true, data }
  } catch (err) {
    console.error('[EMAIL EXCEPTION]', err)
    return { ok: false, error: err }
  }
}
