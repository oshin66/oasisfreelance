'use client'
import { useState } from 'react'
import Link from 'next/link'
import { CheckCircle, Eye, EyeOff, Upload } from 'lucide-react'
import Button from '@/components/ui/Button'
import Toast from '@/components/ui/Toast'

const toBase64 = (file: File) => new Promise<string>((resolve, reject) => {
  const reader = new FileReader()
  reader.readAsDataURL(file)
  reader.onload = () => resolve(reader.result as string)
  reader.onerror = e => reject(e)
})

interface Form {
  name: string; email: string; password: string; confirm: string
  bio: string; skills: string; isSeller: boolean
  paymentQr: File | null
}
type FormErrors = { name?: string; email?: string; password?: string; confirm?: string; paymentQr?: string }
const INIT: Form = { name:'', email:'', password:'', confirm:'', bio:'', skills:'', isSeller:false, paymentQr: null }

const SELLER_PERKS = [
  'Set your own price and packages',
  'Get paid within 48h of delivery',
  'Build your portfolio with real projects',
]
const BUYER_PERKS = [
  'Access 300+ vetted student developers',
  'Transparent pricing, no hidden fees',
  'Managed delivery with quality oversight',
]

export default function RegisterPage() {
  const [form, setForm]     = useState<Form>(INIT)
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw]   = useState(false)
  const [toast, setToast]     = useState<{ msg: string; type: 'success'|'error' } | null>(null)
  const [errors, setErrors]   = useState<FormErrors>({})
  
  const [step, setStep]       = useState<'form' | 'otp'>('form')
  const [otp, setOtp]         = useState('')

  const setField = (k: keyof Form, v: any) => {
    setForm(prev => ({ ...prev, [k]: v }))
    if (errors[k as keyof FormErrors]) setErrors(prev => ({ ...prev, [k]: undefined }))
  }

  const validate = () => {
    const e: FormErrors = {}
    if (form.name.length < 2) e.name = 'Full name required'
    if (!form.email.includes('@')) e.email = 'Valid email required'
    if (form.password.length < 8) e.password = 'Min 8 characters'
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match'
    if (form.isSeller && !form.paymentQr) e.paymentQr = 'Payment QR required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSendOtp = async (ev: React.FormEvent) => {
    ev.preventDefault()
    if (!validate()) return
    setLoading(true)

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email.trim().toLowerCase() }),
      })
      const data = await res.json()
      if (!res.ok) {
         setToast({ msg: data.error ?? 'Failed to send OTP', type: 'error' })
         setLoading(false)
         return
      }
      setToast({ msg: 'OTP sent to your email.', type: 'success' })
      setStep('otp')
    } catch {
      setToast({ msg: 'Network error. Please try again.', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitFinal = async (ev: React.FormEvent) => {
    ev.preventDefault()
    if (otp.length !== 6) {
       setToast({ msg: 'Please enter a 6-digit OTP', type: 'error' })
       return
    }
    setLoading(true)
    try {
      let qrBase64 = null
      if (form.isSeller && form.paymentQr) {
        qrBase64 = await toBase64(form.paymentQr)
      }

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          password: form.password,
          isSeller: form.isSeller,
          bio: form.bio || undefined,
          skills: form.skills || undefined,
          paymentQr: qrBase64 || undefined,
          otp: otp,
        })
      })
      const data = await res.json()
      if (res.ok) {
        setToast({ msg: 'Account created! Redirecting...', type: 'success' })
        setTimeout(() => window.location.href = '/auth/login', 1500)
      } else {
        setToast({ msg: data.error || 'Registration failed', type: 'error' })
      }
    } catch {
      setToast({ msg: 'Network error', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const perks = form.isSeller ? SELLER_PERKS : BUYER_PERKS

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[var(--paper)]">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* ── Left splash ──────────────────────────────────────── */}
      <div className="lg:w-[450px] bg-[var(--forest)] p-12 flex flex-col justify-between relative overflow-hidden">
        {/* Abstract pattern */}
        <div className="absolute top-0 right-0 w-64 h-64 border border-white/5 rounded-full -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-96 h-96 border border-white/5 rounded-full -ml-48 -mb-48" />

        <Link href="/" className="flex items-center gap-3">
          <div className="h-8 px-2 relative overflow-hidden rounded-md border border-white/40 glass-surface bg-white/80 flex items-center justify-center">
            <img src="/logo.png" alt="Craftsmanship Oasis" className="h-5 w-auto object-contain" />
          </div>
          <span className="font-display text-[14px] tracking-[2px] uppercase text-white">
            Craftsmanship <span className="opacity-40">Oasis</span>
          </span>
        </Link>

        <div>
          <p className="text-[9px] uppercase tracking-[4px] text-white/40 font-[Jost] font-medium mb-5">Join today</p>
          <h2 className="font-display text-5xl font-light leading-[1.1] text-white mb-8">
            {form.isSeller
              ? <><em className="text-[var(--teal-pale)]">Sell</em> your<br/>skills to<br/>real brands.</>
              : <>Find your<br/>perfect<br/><em className="text-[var(--teal-pale)]">builder.</em></>
            }
          </h2>
          <ul className="space-y-4">
            {perks.map(p => (
              <li key={p} className="flex items-start gap-3 text-[12px] text-white/55 font-[Jost] font-light leading-relaxed">
                <CheckCircle size={13} className="shrink-0 mt-0.5 text-[var(--teal-pale)] opacity-80" />
                {p}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-[11px] text-white/20 font-[Jost]">© 2025 Craftsmanship Oasis</p>
      </div>

      {/* ── Right form ───────────────────────────────────────── */}
      <div className="flex-1 flex items-start justify-center px-8 py-16 overflow-y-auto">
        <div className="w-full max-w-sm glass-panel rounded-[12px] p-6 md:p-7">

          {/* Mobile logo */}
          <Link href="/" className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="h-8 px-1.5 relative overflow-hidden rounded-md border border-[var(--forest-mid)]/20 glass-surface-soft bg-white/40 flex items-center justify-center">
              <img src="/logo.png" alt="Craftsmanship Oasis" className="h-5 w-auto object-contain" />
            </div>
            <span className="font-display text-[13px] tracking-[2px] uppercase text-[var(--forest)]">Craftsmanship Oasis</span>
          </Link>

          <div className="mb-8">
            <h1 className="font-display text-4xl font-light text-[var(--charcoal)] mb-2">Create Account</h1>
            <p className="text-[13px] text-[var(--grey)] font-[Jost] font-light">
              Already have one?{' '}
              <Link href="/auth/login" className="text-[var(--forest)] hover:underline">Sign in</Link>
            </p>
          </div>

          {/* Role toggle */}
          <div className="flex border-[0.5px] border-[var(--line)] mb-8 glass-surface-soft rounded-[10px] overflow-hidden">
            {([false, true] as const).map(s => (
              <button key={String(s)} type="button" onClick={() => setField('isSeller', s)}
                className={`flex-1 py-3 text-[10px] uppercase tracking-[2px] font-medium font-[Jost] transition-colors
                  ${form.isSeller === s
                    ? 'bg-[var(--forest)] text-[var(--paper)]'
                    : 'text-[var(--grey-light)] hover:text-[var(--grey)]'}`}>
                {s ? 'I am a Seller' : 'I am a Buyer'}
              </button>
            ))}
          </div>

          {step === 'form' ? (
            <form onSubmit={handleSendOtp} className="space-y-5 animate-fade" noValidate>
              <div>
                <label className="block text-[9px] uppercase tracking-[2.5px] text-[var(--grey-light)] mb-2 font-[Jost] font-medium">Full Name</label>
                <input required className="input-underline" placeholder="Your full name"
                  value={form.name} onChange={e => setField('name', e.target.value)} />
                {errors.name && <p className="text-[11px] text-red-500 mt-1 font-[Jost]">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-[9px] uppercase tracking-[2.5px] text-[var(--grey-light)] mb-2 font-[Jost] font-medium">Email Address</label>
                <input type="email" required className="input-underline" placeholder="you@college.ac.in"
                  value={form.email} onChange={e => setField('email', e.target.value)} />
                {errors.email && <p className="text-[11px] text-red-500 mt-1 font-[Jost]">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-[9px] uppercase tracking-[2.5px] text-[var(--grey-light)] mb-2 font-[Jost] font-medium">Password</label>
                <div className="relative">
                  <input type={showPw ? 'text' : 'password'} required className="input-underline pr-8"
                    placeholder="Min. 8 characters"
                    value={form.password} onChange={e => setField('password', e.target.value)} />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 text-[var(--grey-light)] hover:text-[var(--forest)] transition-colors">
                    {showPw ? <EyeOff size={14}/> : <Eye size={14}/>}
                  </button>
                </div>
                {errors.password && <p className="text-[11px] text-red-500 mt-1 font-[Jost]">{errors.password}</p>}
              </div>

              <div>
                <label className="block text-[9px] uppercase tracking-[2.5px] text-[var(--grey-light)] mb-2 font-[Jost] font-medium">Confirm Password</label>
                <input type="password" required className="input-underline" placeholder="Re-enter password"
                  value={form.confirm} onChange={e => setField('confirm', e.target.value)} />
                {errors.confirm && <p className="text-[11px] text-red-500 mt-1 font-[Jost]">{errors.confirm}</p>}
              </div>

              {form.isSeller && (
                <>
                  <div className="border-t border-[var(--line)] pt-5">
                    <p className="text-[9px] uppercase tracking-[2px] text-[var(--forest)] font-[Jost] font-medium mb-4">Seller Profile</p>
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase tracking-[2.5px] text-[var(--grey-light)] mb-2 font-[Jost] font-medium">College / University</label>
                    <input className="input-underline" placeholder="IIT Bombay, NIT Trichy..."
                      value={form.bio} onChange={e => setField('bio', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase tracking-[2.5px] text-[var(--grey-light)] mb-2 font-[Jost] font-medium">Primary Skills</label>
                    <input className="input-underline" placeholder="Python, React, LangChain..."
                      value={form.skills} onChange={e => setField('skills', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase tracking-[2.5px] text-[var(--grey-light)] mb-2 font-[Jost] font-medium">Payment QR Code (Required)</label>
                    <label className="block border-[0.5px] border-dashed border-[var(--line)] p-4 text-center cursor-pointer hover:border-[var(--forest)] transition-colors">
                      <input type="file" className="hidden" accept="image/*" 
                        onChange={e => setField('paymentQr', e.target.files?.[0] ?? null)} />
                      {form.paymentQr ? (
                        <div className="flex items-center justify-center gap-2 text-[var(--forest)] text-[11px] font-[Jost]">
                          <CheckCircle size={14}/> {form.paymentQr.name}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-1">
                          <Upload size={16} className="text-[var(--grey-light)]" />
                          <span className="text-[11px] text-[var(--grey)] font-[Jost]">Upload UPI/Payment QR</span>
                        </div>
                      )}
                    </label>
                    {errors.paymentQr && <p className="text-[11px] text-red-500 mt-1 font-[Jost]">{errors.paymentQr}</p>}
                  </div>
                </>
              )}

              <Button type="submit" size="lg" className="w-full" loading={loading}>
                Create Account
              </Button>

              <p className="text-[10px] text-[var(--grey-light)] text-center font-[Jost] leading-relaxed">
                By joining you agree to our{' '}
                <Link href="#" className="underline hover:text-[var(--forest)]">Terms</Link>
                {' '}and{' '}
                <Link href="#" className="underline hover:text-[var(--forest)]">Privacy Policy</Link>
              </p>
            </form>
          ) : (
            <form onSubmit={handleSubmitFinal} className="space-y-6 animate-scale-in">
              <div className="text-center mb-6">
                <p className="text-[14px] text-[var(--charcoal)] font-[Jost] font-medium mb-2">Verify your email</p>
                <p className="text-[12px] text-[var(--grey)] font-[Jost]">We&apos;ve sent a 6-digit OTP to <strong className="text-[var(--forest)]">{form.email}</strong>.</p>
              </div>
              
              <div>
                <input 
                  type="text" 
                  maxLength={6}
                  required 
                  className="input-underline text-center text-xl tracking-[10px]" 
                  placeholder="------"
                  value={otp} 
                  onChange={e => setOtp(e.target.value.replace(/\D/g, ''))} 
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="ghost" size="sm" onClick={() => setStep('form')} disabled={loading}>Back</Button>
                <Button type="submit" size="lg" className="flex-1" loading={loading}>Complete Registration</Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
