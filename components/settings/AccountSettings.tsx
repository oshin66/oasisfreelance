'use client'
import { useMemo, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import Button from '@/components/ui/Button'
import Toast from '@/components/ui/Toast'
import { Input } from '@/components/ui/FormElements'
import { SessionUserExt } from './types'

type Props = { user: SessionUserExt; onEmailUpdated: (email: string) => void }

function strengthLabel(value: string) {
  let score = 0
  if (value.length >= 8) score++
  if (/[A-Z]/.test(value)) score++
  if (/[0-9]/.test(value)) score++
  if (/[!@#$%^&*(),.?":{}|<>]/.test(value)) score++
  if (score <= 1) return 'Weak'
  if (score === 2) return 'Fair'
  if (score === 3) return 'Strong'
  return 'Very Strong'
}

export default function AccountSettings({ user, onEmailUpdated }: Props) {
  const [newEmail, setNewEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [countdown, setCountdown] = useState(60)
  const [sendingOtp, setSendingOtp] = useState(false)
  const [verifyingOtp, setVerifyingOtp] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [savingPassword, setSavingPassword] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  const masked = `${user.email.slice(0, 2)}***@${user.email.split('@')[1] || ''}`
  const strength = useMemo(() => strengthLabel(newPassword), [newPassword])

  const startTimer = () => {
    setCountdown(60)
    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(timer)
          return 0
        }
        return c - 1
      })
    }, 1000)
  }

  const requestOtp = async () => {
    if (!newEmail) return
    setSendingOtp(true)
    try {
      const res = await fetch('/api/settings/email/request', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newEmail }),
      })
      const data = await res.json()
      if (!res.ok) return setToast({ msg: data.error || 'Failed to send OTP', type: 'error' })
      setOtpSent(true)
      setToast({ msg: 'OTP sent to new email', type: 'success' })
      startTimer()
    } catch {
      setToast({ msg: 'Network error while sending OTP', type: 'error' })
    } finally {
      setSendingOtp(false)
    }
  }

  const verifyOtp = async () => {
    setVerifyingOtp(true)
    try {
      const res = await fetch('/api/settings/email/verify', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newEmail, otp }),
      })
      const data = await res.json()
      if (!res.ok) return setToast({ msg: data.error || 'OTP verification failed', type: 'error' })
      onEmailUpdated(newEmail)
      setToast({ msg: 'Email updated successfully', type: 'success' })
      setOtp('')
      setOtpSent(false)
      setNewEmail('')
    } catch {
      setToast({ msg: 'Network error while verifying OTP', type: 'error' })
    } finally {
      setVerifyingOtp(false)
    }
  }

  const savePassword = async () => {
    if (newPassword !== confirmPassword) return setToast({ msg: 'Passwords do not match', type: 'error' })
    setSavingPassword(true)
    try {
      const res = await fetch('/api/settings/password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      const data = await res.json()
      if (!res.ok) return setToast({ msg: data.error || 'Failed to update password', type: 'error' })
      setToast({ msg: 'Password updated successfully', type: 'success' })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch {
      setToast({ msg: 'Network error while changing password', type: 'error' })
    } finally {
      setSavingPassword(false)
    }
  }

  return (
    <section className="glass-panel rounded-2xl p-6">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      <h2 className="font-display text-3xl mb-6">Account Settings</h2>

      <div className="space-y-6">
        <div className="glass-surface-soft rounded-xl p-4">
          <h3 className="font-medium mb-3">Change Email</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <Input label="Current Email" value={masked} readOnly />
            <Input label="New Email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
          </div>
          <div className="flex items-center gap-3 mt-3">
            <Button size="sm" loading={sendingOtp} onClick={requestOtp}>Send OTP</Button>
            {otpSent && <span className="text-[12px] text-[var(--grey)]">Resend in {countdown}s</span>}
            {otpSent && countdown === 0 && <Button size="sm" variant="outline" onClick={requestOtp}>Resend</Button>}
          </div>
          {otpSent && (
            <div className="mt-3 flex items-center gap-3">
              <Input placeholder="6-digit OTP" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} />
              <Button size="sm" loading={verifyingOtp} onClick={verifyOtp}>Verify</Button>
            </div>
          )}
        </div>

        <div className="glass-surface-soft rounded-xl p-4">
          <h3 className="font-medium mb-3">Change Password</h3>
          <div className="space-y-4">
            <div className="relative">
              <Input label="Current Password" type={showPw ? 'text' : 'password'} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
              <button type="button" className="absolute right-3 top-9 text-[var(--grey-light)]" onClick={() => setShowPw((s) => !s)}>
                {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            <Input label="New Password" type={showPw ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} hint={`Strength: ${strength}`} />
            <Input label="Confirm New Password" type={showPw ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            <p className="text-[11px] text-[var(--grey-light)]">Must be at least 8 chars with uppercase, number, and special character.</p>
            <Button size="sm" loading={savingPassword} onClick={savePassword}>Update Password</Button>
          </div>
        </div>

        <div className="glass-surface-soft rounded-xl p-4">
          <div className="flex items-center gap-3">
            <h3 className="font-medium">Two-Factor Authentication</h3>
            <span className="text-[10px] uppercase tracking-[1px] px-2 py-0.5 rounded-full bg-[var(--paper-dark)]">Coming Soon</span>
          </div>
        </div>
      </div>
    </section>
  )
}
