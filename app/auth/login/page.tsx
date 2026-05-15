'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Eye, EyeOff } from 'lucide-react'
import Button from '@/components/ui/Button'
import Toast from '@/components/ui/Toast'

export default function LoginPage() {
  const [form, setForm]     = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw]   = useState(false)
  const [toast, setToast]     = useState<{ msg: string; type: 'success'|'error' } | null>(null)

  const set = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res  = await fetch('/api/auth/login', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          email:    form.email.trim().toLowerCase(),
          password: form.password,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setToast({ msg: data.error ?? 'Invalid credentials', type: 'error' })
        setLoading(false)
        return
      }
      const role = data.data?.user?.role
      const dest =
        role === 'ADMIN'  ? '/admin' :
        role === 'SELLER' ? '/dashboard/seller' :
                            '/dashboard/buyer'
      window.location.href = dest
    } catch {
      setToast({ msg: 'Network error. Please try again.', type: 'error' })
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen glass-page flex items-center justify-center px-4">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="h-8 px-1.5 relative overflow-hidden rounded-md border border-[var(--forest-mid)]/20 glass-surface-soft bg-white/40 flex items-center justify-center">
              <img src="/logo.png" alt="Craftsmanship Oasis" className="h-5 w-auto object-contain" />
            </div>
            <span className="font-display text-[14px] tracking-[2px] uppercase text-[var(--forest)]">
              Craftsmanship Oasis
            </span>
          </Link>
          <h1 className="font-display text-[34px] font-light text-[var(--charcoal)]">Welcome back.</h1>
          <p className="text-[12px] text-[var(--grey)] mt-2 font-[Jost]">Sign in to your account</p>
        </div>

        <div className="glass-panel rounded-[12px] p-8 relative">
          <div className="absolute top-0 left-8 right-8 h-[2px] bg-[var(--forest)]" />
          <form onSubmit={handleSubmit} className="flex flex-col gap-6 mt-2" noValidate>
            <div>
              <label className="block text-[9px] uppercase tracking-[2.5px] text-[var(--grey-light)] mb-2 font-[Jost] font-medium">
                Email Address
              </label>
              <input type="email" className="input-underline" placeholder="you@example.com"
                value={form.email} onChange={e => set('email', e.target.value)} required />
            </div>
            <div>
              <label className="block text-[9px] uppercase tracking-[2.5px] text-[var(--grey-light)] mb-2 font-[Jost] font-medium">
                Password
              </label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} className="input-underline pr-8"
                  placeholder="••••••••"
                  value={form.password} onChange={e => set('password', e.target.value)} required />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-[var(--grey-light)] hover:text-[var(--forest)]">
                  {showPw ? <EyeOff size={14}/> : <Eye size={14}/>}
                </button>
              </div>
              <div className="flex justify-end mt-2">
                <Link 
                  href="/forgot-password" 
                  className="text-[10px] uppercase tracking-[1.5px] text-[var(--grey-light)] hover:text-[var(--forest)] font-medium transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            <Button type="submit" size="lg" loading={loading} className="w-full">
              Sign In
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-[0.5px] bg-[var(--line)]"/>
            <span className="text-[9px] uppercase tracking-[2px] text-[var(--grey-light)] font-[Jost] font-medium">or</span>
            <div className="flex-1 h-[0.5px] bg-[var(--line)]"/>
          </div>

          {/* Google Sign In */}
          <a
            href="/api/auth/google"
            className="w-full flex items-center justify-center gap-3 py-3 px-4 border-[0.5px] border-[var(--line)] rounded-[8px] text-[13px] font-[Jost] font-medium text-[var(--charcoal)] hover:border-[var(--forest)] hover:bg-[var(--paper-dark)] transition-all duration-200"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.26c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
              <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </a>

          <p className="text-center text-[11px] text-[var(--grey)] mt-6 font-[Jost]">
            Don&apos;t have an account?{' '}
            <Link href="/auth/register" className="text-[var(--forest)] hover:underline">
              Register free
            </Link>
          </p>
        </div>

        <div className="text-center mt-8">
          <Link href="/" className="text-[10px] uppercase tracking-[2px] text-[var(--grey-light)] hover:text-[var(--forest)] transition-colors">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
