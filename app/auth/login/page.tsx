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
