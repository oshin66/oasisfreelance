'use client'
import { useState } from 'react'
import Button from '@/components/ui/Button'
import Toast from '@/components/ui/Toast'
import { Input, Select } from '@/components/ui/FormElements'
import { SessionSettings } from './types'

type Props = { initial: SessionSettings }

export default function SellerSettings({ initial }: Props) {
  const [state, setState] = useState({
    upiId: initial.upiId || '',
    bankAccount: initial.bankAccount || '',
    bankIfsc: initial.bankIfsc || '',
    bankHolder: initial.bankHolder || '',
    vacationMode: initial.vacationMode,
    responseTime: initial.responseTime,
  })
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  const save = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/settings/seller', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state),
      })
      const data = await res.json()
      if (!res.ok) return setToast({ msg: data.error || 'Failed to save seller settings', type: 'error' })
      setToast({ msg: 'Seller settings updated', type: 'success' })
    } catch {
      setToast({ msg: 'Network error while saving seller settings', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="glass-panel rounded-2xl p-6">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      <h2 className="font-display text-3xl mb-6">Seller Settings</h2>
      <div className="grid md:grid-cols-2 gap-4">
        <Input label="UPI ID" value={state.upiId} onChange={(e) => setState((s) => ({ ...s, upiId: e.target.value }))} />
        <Select label="Response Time" value={state.responseTime} onChange={(e) => setState((s) => ({ ...s, responseTime: e.target.value as '1hr' | '4hr' | '24hr' }))}>
          <option value="1hr">1hr</option>
          <option value="4hr">4hr</option>
          <option value="24hr">24hr</option>
        </Select>
        <Input label="Account Number" value={state.bankAccount} onChange={(e) => setState((s) => ({ ...s, bankAccount: e.target.value }))} />
        <Input label="IFSC" value={state.bankIfsc} onChange={(e) => setState((s) => ({ ...s, bankIfsc: e.target.value }))} />
        <Input label="Account Holder Name" value={state.bankHolder} onChange={(e) => setState((s) => ({ ...s, bankHolder: e.target.value }))} />
      </div>
      <div className="flex items-center justify-between mt-5 p-3 rounded-xl glass-surface-soft">
        <span>Gig Vacation Mode</span>
        <button
          type="button"
          onClick={() => setState((s) => ({ ...s, vacationMode: !s.vacationMode }))}
          className={`w-11 h-6 rounded-full p-1 transition-colors ${state.vacationMode ? 'bg-[var(--forest)]' : 'bg-[var(--grey-light)]'}`}
        >
          <span className={`block w-4 h-4 rounded-full bg-white transition-transform ${state.vacationMode ? 'translate-x-5' : ''}`} />
        </button>
      </div>
      <div className="mt-4">
        <Button size="md" loading={loading} onClick={save}>Save Seller Settings</Button>
      </div>
    </section>
  )
}
