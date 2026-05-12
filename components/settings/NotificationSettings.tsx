'use client'
import { useState } from 'react'
import Button from '@/components/ui/Button'
import Toast from '@/components/ui/Toast'
import { SessionSettings } from './types'

type Props = { initial: SessionSettings }

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between py-2">
      <span className="text-[14px]">{label}</span>
      <button type="button" onClick={() => onChange(!checked)} className={`w-11 h-6 rounded-full p-1 transition-colors ${checked ? 'bg-[var(--forest)]' : 'bg-[var(--grey-light)]'}`}>
        <span className={`block w-4 h-4 rounded-full bg-white transition-transform ${checked ? 'translate-x-5' : ''}`} />
      </button>
    </label>
  )
}

export default function NotificationSettings({ initial }: Props) {
  const [state, setState] = useState(initial)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  const save = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/settings/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state),
      })
      const data = await res.json()
      if (!res.ok) return setToast({ msg: data.error || 'Failed to save preferences', type: 'error' })
      setToast({ msg: 'Notification preferences saved', type: 'success' })
    } catch {
      setToast({ msg: 'Network error while saving notifications', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="glass-panel rounded-2xl p-6">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      <h2 className="font-display text-3xl mb-6">Notifications</h2>
      <div className="glass-surface-soft rounded-xl p-4 space-y-1">
        <Toggle label="Email: New order" checked={state.emailNewOrder} onChange={(v) => setState((s) => ({ ...s, emailNewOrder: v }))} />
        <Toggle label="Email: Order update" checked={state.emailOrderUpdate} onChange={(v) => setState((s) => ({ ...s, emailOrderUpdate: v }))} />
        <Toggle label="Email: Payment verified" checked={state.emailPaymentVerified} onChange={(v) => setState((s) => ({ ...s, emailPaymentVerified: v }))} />
        <Toggle label="In-app notifications" checked={state.inAppNotifications} onChange={(v) => setState((s) => ({ ...s, inAppNotifications: v }))} />
        <Toggle label="Promotional emails" checked={state.emailPromotional} onChange={(v) => setState((s) => ({ ...s, emailPromotional: v }))} />
        <Toggle label="Weekly digest" checked={state.weeklyDigest} onChange={(v) => setState((s) => ({ ...s, weeklyDigest: v }))} />
      </div>
      <div className="mt-4">
        <Button size="md" loading={loading} onClick={save}>Save Preferences</Button>
      </div>
    </section>
  )
}
