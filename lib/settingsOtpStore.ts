type OtpRecord = {
  code: string
  expiresAt: number
}

// In-memory OTP store for email-change verification.
// Replace with Redis for multi-instance deployments.
const otpStore = new Map<string, OtpRecord>()

export function setEmailOtp(key: string, code: string, ttlMs = 10 * 60 * 1000) {
  otpStore.set(key, { code, expiresAt: Date.now() + ttlMs })
}

export function verifyEmailOtp(key: string, candidate: string): boolean {
  const rec = otpStore.get(key)
  if (!rec) return false
  if (Date.now() > rec.expiresAt) {
    otpStore.delete(key)
    return false
  }
  if (rec.code !== candidate) return false
  otpStore.delete(key)
  return true
}
