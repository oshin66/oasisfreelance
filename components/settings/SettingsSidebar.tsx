'use client'
import { Bell, Shield, UserRound, Store, AlertTriangle, KeyRound } from 'lucide-react'
import { SettingsTab } from './types'

type Props = {
  active: SettingsTab
  setActive: (tab: SettingsTab) => void
  isSeller: boolean
}

const items: Array<{ tab: SettingsTab; label: string; icon: React.ComponentType<{ size?: number }> }> = [
  { tab: 'profile', label: 'Profile', icon: UserRound },
  { tab: 'account', label: 'Account', icon: KeyRound },
  { tab: 'notifications', label: 'Notifications', icon: Bell },
  { tab: 'privacy', label: 'Privacy', icon: Shield },
  { tab: 'seller', label: 'Seller', icon: Store },
  { tab: 'danger', label: 'Danger Zone', icon: AlertTriangle },
]

export default function SettingsSidebar({ active, setActive, isSeller }: Props) {
  const visible = items.filter((i) => (i.tab === 'seller' ? isSeller : true))

  return (
    <>
      <aside className="hidden md:block sticky top-24 h-fit glass-panel rounded-2xl p-3">
        <nav className="space-y-1">
          {visible.map((item) => {
            const Icon = item.icon
            const selected = active === item.tab
            return (
              <button
                key={item.tab}
                onClick={() => setActive(item.tab)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left transition-colors ${
                  selected ? 'bg-[var(--forest)] text-[var(--paper)]' : 'text-[var(--grey)] hover:bg-white/40'
                }`}
              >
                <Icon size={14} />
                <span className="text-[12px]">{item.label}</span>
              </button>
            )
          })}
        </nav>
      </aside>

      <div className="md:hidden overflow-x-auto no-scrollbar pb-2">
        <div className="flex gap-2 min-w-max">
          {visible.map((item) => {
            const Icon = item.icon
            const selected = active === item.tab
            return (
              <button
                key={item.tab}
                onClick={() => setActive(item.tab)}
                className={`inline-flex items-center gap-2 px-3 py-2 rounded-full border ${
                  selected ? 'bg-[var(--forest)] text-[var(--paper)] border-[var(--forest)]' : 'bg-white/70 text-[var(--grey)] border-[var(--line)]'
                }`}
              >
                <Icon size={13} />
                <span className="text-[11px] uppercase tracking-[1px]">{item.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </>
  )
}
