'use client'
import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import Toast from '@/components/ui/Toast'
import { SessionUserExt } from './types'
import { Input } from '@/components/ui/FormElements'

type Props = { user: SessionUserExt }

export default function DangerZone({ user }: Props) {
  const [deactivateOpen, setDeactivateOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deactivateCode, setDeactivateCode] = useState('')
  const [deleteEmail, setDeleteEmail] = useState('')
  const [loadingDeactivate, setLoadingDeactivate] = useState(false)
  const [loadingDelete, setLoadingDelete] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  const deactivate = async () => {
    if (deactivateCode !== 'DEACTIVATE') return setToast({ msg: 'Type DEACTIVATE to continue', type: 'error' })
    setLoadingDeactivate(true)
    try {
      const res = await fetch('/api/settings/account/deactivate', { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) return setToast({ msg: data.error || 'Failed to deactivate account', type: 'error' })
      setToast({ msg: 'Account deactivated successfully', type: 'success' })
      setDeactivateOpen(false)
    } catch {
      setToast({ msg: 'Network error while deactivating account', type: 'error' })
    } finally {
      setLoadingDeactivate(false)
    }
  }

  const scheduleDelete = async () => {
    if (deleteEmail !== user.email) return setToast({ msg: 'Enter your exact email to confirm', type: 'error' })
    setLoadingDelete(true)
    try {
      const res = await fetch('/api/settings/account/delete', { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) return setToast({ msg: data.error || 'Failed to schedule account deletion', type: 'error' })
      setToast({ msg: 'Account deletion scheduled. You will receive a confirmation email.', type: 'success' })
      setDeleteOpen(false)
    } catch {
      setToast({ msg: 'Network error while scheduling deletion', type: 'error' })
    } finally {
      setLoadingDelete(false)
    }
  }

  return (
    <section className="glass-panel rounded-2xl p-6">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      <h2 className="font-display text-3xl mb-6">Danger Zone</h2>
      <div className="space-y-4">
        <div className="rounded-xl border border-red-300 bg-red-50/60 p-4">
          <p className="font-medium text-red-800">Deactivate Account</p>
          <p className="text-[13px] text-red-700 mt-1">Your gigs and profile will be hidden. You can reactivate anytime.</p>
          <Button variant="danger" size="sm" className="mt-3" onClick={() => setDeactivateOpen(true)}>Deactivate Account</Button>
        </div>
        <div className="rounded-xl border border-red-400 bg-red-100/60 p-4">
          <p className="font-medium text-red-900">Delete Account Permanently</p>
          <p className="text-[13px] text-red-800 mt-1">This cannot be undone. All your data, orders, and gigs will be permanently deleted.</p>
          <Button variant="danger" size="sm" className="mt-3 bg-[#8a1c1c] hover:bg-[#6f1414]" onClick={() => setDeleteOpen(true)}>
            <AlertTriangle size={13} /> Delete Permanently
          </Button>
        </div>
      </div>

      <Modal isOpen={deactivateOpen} onClose={() => setDeactivateOpen(false)} title="Confirm Deactivation">
        <p className="text-[13px] mb-3">Type <strong>DEACTIVATE</strong> to confirm.</p>
        <Input value={deactivateCode} onChange={(e) => setDeactivateCode(e.target.value)} />
        <div className="mt-4 flex gap-3">
          <Button variant="ghost" size="sm" onClick={() => setDeactivateOpen(false)}>Cancel</Button>
          <Button variant="danger" size="sm" loading={loadingDeactivate} onClick={deactivate}>Confirm</Button>
        </div>
      </Modal>

      <Modal isOpen={deleteOpen} onClose={() => setDeleteOpen(false)} title="Schedule Permanent Deletion">
        <p className="text-[13px] mb-3">Type your full email address to confirm:</p>
        <Input value={deleteEmail} onChange={(e) => setDeleteEmail(e.target.value)} placeholder={user.email} />
        <div className="mt-4 flex gap-3">
          <Button variant="ghost" size="sm" onClick={() => setDeleteOpen(false)}>Cancel</Button>
          <Button variant="danger" size="sm" className="bg-[#8a1c1c] hover:bg-[#6f1414]" loading={loadingDelete} onClick={scheduleDelete}>
            Confirm Deletion
          </Button>
        </div>
      </Modal>
    </section>
  )
}
