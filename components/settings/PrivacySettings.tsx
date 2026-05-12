'use client'
import { useState } from 'react'
import Button from '@/components/ui/Button'
import Toast from '@/components/ui/Toast'
import { Select } from '@/components/ui/FormElements'
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

export default function PrivacySettings({ initial }: Props) {
  const [state, setState] = useState(initial)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const [showExportInfo, setShowExportInfo] = useState(false)

  const save = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/settings/privacy', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileVisibility: state.profileVisibility,
          showOnlineStatus: state.showOnlineStatus,
          allowDirectMessages: state.allowDirectMessages,
        }),
      })
      const data = await res.json()
      if (!res.ok) return setToast({ msg: data.error || 'Failed to save privacy settings', type: 'error' })
      setToast({ msg: 'Privacy settings saved', type: 'success' })
    } catch {
      setToast({ msg: 'Network error while saving privacy settings', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="glass-panel rounded-2xl p-6">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      <h2 className="font-display text-3xl mb-6">Privacy</h2>
      <div className="glass-surface-soft rounded-xl p-4 space-y-2">
        <Select label="Profile Visibility" value={state.profileVisibility} onChange={(e) => setState((s) => ({ ...s, profileVisibility: e.target.value as 'public' | 'private' }))}>
          <option value="public">Public</option>
          <option value="private">Private</option>
        </Select>
        <Toggle label="Show online status" checked={state.showOnlineStatus} onChange={(v) => setState((s) => ({ ...s, showOnlineStatus: v }))} />
        <Toggle label="Allow direct messages" checked={state.allowDirectMessages} onChange={(v) => setState((s) => ({ ...s, allowDirectMessages: v }))} />
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <Button size="md" loading={loading} onClick={save}>Save Privacy</Button>
        <Button size="md" variant="outline" onClick={() => setShowExportInfo(true)}>Request your data</Button>
      </div>
      {showExportInfo && (
        <div className="mt-3 p-3 rounded-xl glass-surface-soft text-[13px]">We&apos;ll email you a download link within 24 hours.</div>
      )}
    </section>
  )
}
