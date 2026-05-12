'use client'
import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import SettingsSidebar from '@/components/settings/SettingsSidebar'
import ProfileSettings from '@/components/settings/ProfileSettings'
import AccountSettings from '@/components/settings/AccountSettings'
import NotificationSettings from '@/components/settings/NotificationSettings'
import PrivacySettings from '@/components/settings/PrivacySettings'
import SellerSettings from '@/components/settings/SellerSettings'
import DangerZone from '@/components/settings/DangerZone'
import { SessionSettings, SessionUserExt, SettingsTab } from '@/components/settings/types'

const defaultSettings: SessionSettings = {
  emailNewOrder: true,
  emailOrderUpdate: true,
  emailPaymentVerified: true,
  emailPromotional: false,
  weeklyDigest: true,
  inAppNotifications: true,
  profileVisibility: 'public',
  showOnlineStatus: true,
  allowDirectMessages: true,
  upiId: null,
  bankAccount: null,
  bankIfsc: null,
  bankHolder: null,
  vacationMode: false,
  responseTime: '24hr',
}

export default function SettingsPage() {
  const [tab, setTab] = useState<SettingsTab>('profile')
  const [user, setUser] = useState<SessionUserExt | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        const u = data?.data?.user
        if (!u) {
          window.location.href = '/auth/login'
          return
        }
        setUser({
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          isSeller: u.isSeller,
          avatar: u.avatar,
          college: u.college,
          sellerBio: u.sellerBio,
          skills: u.skills,
          githubUrl: u.githubUrl,
          linkedinUrl: u.linkedinUrl,
          settings: u.settings || null,
        })
      })
      .finally(() => setLoading(false))
  }, [])

  const settings = useMemo(() => ({ ...defaultSettings, ...(user?.settings || {}) }), [user])

  if (loading || !user) return <div className="text-center py-20 text-[var(--grey)]">Loading settings...</div>

  const renderTab = () => {
    if (tab === 'profile') return <ProfileSettings user={user} onSaved={(next) => setUser((prev) => (prev ? { ...prev, ...next } : prev))} />
    if (tab === 'account') return <AccountSettings user={user} onEmailUpdated={(email) => setUser((prev) => (prev ? { ...prev, email } : prev))} />
    if (tab === 'notifications') return <NotificationSettings initial={settings} />
    if (tab === 'privacy') return <PrivacySettings initial={settings} />
    if (tab === 'seller' && user.isSeller) return <SellerSettings initial={settings} />
    if (tab === 'danger') return <DangerZone user={user} />
    return <ProfileSettings user={user} onSaved={(next) => setUser((prev) => (prev ? { ...prev, ...next } : prev))} />
  }

  return (
    <div>
      <div className="mb-7">
        <h1 className="font-display text-4xl text-[var(--charcoal)]">Settings</h1>
        <p className="text-[13px] text-[var(--grey)] mt-1">Manage your profile, account, privacy and preferences.</p>
      </div>

      <div className="grid md:grid-cols-[260px_minmax(0,1fr)] gap-5">
        <SettingsSidebar active={tab} setActive={setTab} isSeller={user.isSeller} />
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
          >
            {renderTab()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
