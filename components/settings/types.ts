export type SettingsTab = 'profile' | 'account' | 'notifications' | 'privacy' | 'seller' | 'danger'

export type SessionSettings = {
  emailNewOrder: boolean
  emailOrderUpdate: boolean
  emailPaymentVerified: boolean
  emailPromotional: boolean
  weeklyDigest: boolean
  inAppNotifications: boolean
  profileVisibility: 'public' | 'private'
  showOnlineStatus: boolean
  allowDirectMessages: boolean
  upiId?: string | null
  bankAccount?: string | null
  bankIfsc?: string | null
  bankHolder?: string | null
  vacationMode: boolean
  responseTime: '1hr' | '4hr' | '24hr'
}

export type SessionUserExt = {
  id: string
  name: string
  email: string
  role: 'BUYER' | 'SELLER' | 'ADMIN'
  isSeller: boolean
  avatar?: string | null
  college?: string | null
  sellerBio?: string | null
  skills?: string | null
  githubUrl?: string | null
  linkedinUrl?: string | null
  settings?: SessionSettings | null
}
