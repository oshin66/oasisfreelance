'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Package, Clock, CheckCircle, AlertCircle, Star, RefreshCw, Send, FileText } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import OrderProgress from '@/components/order/OrderProgress'
import Modal from '@/components/ui/Modal'
import Toast from '@/components/ui/Toast'
import { useAuth } from '@/lib/useAuth'
import type { OrderStatus } from '@/types'

type BuyerOrder = {
  id: string
  status: OrderStatus
  package: string
  price: number
  createdAt: string
  hasReview?: boolean
  requirements?: string
  gig: { title: string; category: string }
  seller: { name: string }
}

export default function BuyerDashboard() {
  const { user, loading: authLoading } = useAuth('BUYER')
  const [orders, setOrders]           = useState<BuyerOrder[]>([])
  const [activeTab, setActiveTab]     = useState<'active' | 'completed'>('active')
  const [dataLoading, setDataLoading] = useState(true)
  const [reqModal, setReqModal]       = useState<string | null>(null)
  const [reviewModal, setReviewModal] = useState<BuyerOrder | null>(null)
  const [toast, setToast]             = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchOrders = useCallback(async () => {
    setDataLoading(true)
    try {
      const res = await fetch('/api/orders?view=buyer')
      if (res.ok) {
        const d = await res.json()
        setOrders(d.orders ?? [])
      }
    } catch {
      setToast({ msg: 'Failed to sync orders', type: 'error' })
    } finally {
      setDataLoading(false)
    }
  }, [])

  useEffect(() => {
    if (user) fetchOrders()
  }, [user, fetchOrders])

  const handleAction = async (orderId: string, action: string, data: Record<string, unknown> = {}) => {
    setActionLoading(orderId)
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...data })
      })
      if (res.ok) {
        setToast({ msg: `Action successful: ${action.replace('_', ' ')}`, type: 'success' })
        fetchOrders()
      } else {
        const d = await res.json()
        setToast({ msg: d.error || 'Action failed', type: 'error' })
      }
    } catch {
      setToast({ msg: 'Network error', type: 'error' })
    } finally {
      setActionLoading(null)
    }
  }

  if (authLoading) return null

  const active    = orders.filter(o => !['COMPLETED','CANCELLED'].includes(o.status))
  const completed = orders.filter(o =>  ['COMPLETED','CANCELLED'].includes(o.status))
  const displayed = activeTab === 'active' ? active : completed

  return (
    <div className="min-h-screen bg-[var(--paper)]">
      <Navbar />
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)}/>}

      <div className="max-w-6xl mx-auto px-8 py-12 pt-24">
        {/* Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-[9px] uppercase tracking-[4px] text-[var(--forest-light)] font-medium font-[Jost] mb-1">Buyer Dashboard</p>
            <h1 className="font-display text-4xl font-light text-[var(--charcoal)]">
              Hello, <em>{user?.name?.split(' ')[0] || user?.email?.split('@')[0]}.</em>
            </h1>
          </div>
          <div className="flex gap-4">
            <button onClick={fetchOrders} className="text-[10px] uppercase tracking-[2px] text-[var(--grey-light)] font-[Jost] mb-2 hover:text-[var(--forest)]">
              <RefreshCw size={14} className={dataLoading ? 'animate-spin' : ''}/>
            </button>
            <Link href="/browse"><Button size="md">+ New Order</Button></Link>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-[1px] bg-[var(--line)] mb-10 border-[0.5px] border-[var(--line)]">
          {[
            { label: 'Active Orders', val: active.length, icon: <Clock size={14}/> },
            { label: 'Completed', val: completed.length, icon: <CheckCircle size={14}/> },
            { label: 'Total Spent', val: `₹${orders.reduce((s,o)=>s+o.price,0).toLocaleString()}`, icon: <Star size={14}/> },
            { label: 'Support Tickets', val: 0, icon: <AlertCircle size={14}/> },
          ].map(s => (
            <div key={s.label} className="bg-[var(--paper)] p-6">
              <div className="flex items-center gap-2 text-[var(--grey-light)] mb-2">
                {s.icon}<span className="text-[9px] uppercase tracking-[2px] font-[Jost] font-medium">{s.label}</span>
              </div>
              <div className="font-display text-3xl font-light text-[var(--charcoal)]">{s.val}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[var(--line)] mb-8">
          {[
            { key: 'active', label: `Active (${active.length})` },
            { key: 'completed', label: 'History' },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key as any)}
              className={`px-6 py-3 text-[11px] uppercase tracking-[2px] font-medium font-[Jost] border-b-2 transition-colors
                ${activeTab===tab.key ? 'border-[var(--forest)] text-[var(--forest)]' : 'border-transparent text-[var(--grey-light)] hover:text-[var(--grey)]'}`}>
              {tab.label}
            </button>
          ))}
        </div>

        {dataLoading ? (
          <div className="text-center py-20"><RefreshCw size={24} className="mx-auto animate-spin text-[var(--grey-light)]"/></div>
        ) : displayed.length === 0 ? (
          <div className="text-center py-32 border-[0.5px] border-dashed border-[var(--line)]">
            <Package size={32} className="mx-auto mb-4 text-[var(--line)]"/>
            <p className="text-[13px] text-[var(--grey)] font-[Jost]">No orders found in this category.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayed.map(order => (
              <div key={order.id} className="border-[0.5px] border-[var(--line)] bg-[var(--paper)] hover:border-[var(--forest)]/30 transition-colors">
                <div className={`h-[2px] ${order.status==='COMPLETED'?'bg-[var(--forest)]':'bg-[var(--teal)]'}`}/>
                <div className="p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <Badge variant={order.status==='COMPLETED'?'forest':'teal'} size="sm">{order.status}</Badge>
                        <span className="text-[10px] text-[var(--grey-light)] font-[Jost]">Order #CO-{order.id.slice(-8).toUpperCase()}</span>
                      </div>
                      <h3 className="text-[15px] font-medium text-[var(--charcoal)] font-[Jost] mb-1">{order.gig.title}</h3>
                      <p className="text-[12px] text-[var(--grey)] font-[Jost] font-light">
                        {order.package} Package · Seller: {order.seller.name} · ₹{order.price.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] uppercase tracking-[2px] text-[var(--grey-light)] font-[Jost]">Ordered on</p>
                      <p className="text-[13px] font-medium text-[var(--charcoal)] font-[Jost]">{new Date(order.createdAt).toLocaleDateString('en-IN')}</p>
                    </div>
                  </div>

                  {order.status === 'REQUIREMENTS_PENDING' && (
                    <div className="flex items-center justify-between p-4 bg-[var(--paper-dark)] border-[0.5px] border-[var(--line)] mb-5">
                      <div className="flex items-center gap-3">
                        <FileText size={16} className="text-[var(--forest)]"/>
                        <p className="text-[12px] text-[var(--grey)] font-[Jost]">Seller needs requirements to start work.</p>
                      </div>
                      <Button size="sm" onClick={() => setReqModal(order.id)}>Submit Now</Button>
                    </div>
                  )}

                  {!['PAYMENT_VERIFICATION','PENDING_PAYMENT','REQUIREMENTS_PENDING'].includes(order.status) && (
                    <div className="mb-5"><OrderProgress status={order.status}/></div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap gap-3 pt-4 border-t border-[var(--line)]">
                    {order.status === 'DELIVERED' && (
                      <>
                        <Button size="sm" onClick={() => handleAction(order.id, 'complete')} loading={actionLoading === order.id}>
                          <CheckCircle size={12}/> Accept Delivery
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleAction(order.id, 'request_revision')} loading={actionLoading === order.id}>Request Revision</Button>
                      </>
                    )}
                    {order.status === 'COMPLETED' && !order.hasReview && (
                      <Button size="sm" onClick={() => setReviewModal(order)}>Leave a Review</Button>
                    )}
                    <Button variant="ghost" size="sm">Message Seller</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review Modal */}
      <Modal isOpen={!!reviewModal} onClose={() => setReviewModal(null)} title="Rate your experience" size="sm">
        {reviewModal && (
          <ReviewForm 
            onSubmit={async (reviewData) => {
              const res = await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId: reviewModal.id, ...reviewData })
              })
              if (res.ok) {
                setReviewModal(null)
                setToast({ msg: 'Review submitted! Thank you.', type: 'success' })
                fetchOrders()
              } else {
                const d = await res.json()
                setToast({ msg: d.error || 'Failed to submit review', type: 'error' })
              }
            }}
          />
        )}
      </Modal>

      {/* Requirements modal */}
      <Modal isOpen={!!reqModal} onClose={() => setReqModal(null)} title="Order Requirements">
        <RequirementsForm 
          onSubmit={(reqs) => { 
            if (reqModal) handleAction(reqModal, 'submit_requirements', { requirements: reqs })
            setReqModal(null) 
          }}
          loading={actionLoading !== null}
        />
      </Modal>
    </div>
  )
}

function ReviewForm({ onSubmit }: { onSubmit: (data: { rating: number, comment: string }) => Promise<void> }) {
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (comment.length < 5) return
    setLoading(true)
    await onSubmit({ rating, comment })
    setLoading(false)
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-[9px] uppercase tracking-[2.5px] text-[var(--grey-light)] mb-3 font-[Jost] font-medium">Your Rating</p>
        <div className="flex gap-2">
          {[1,2,3,4,5].map(n => (
            <button key={n} onClick={() => setRating(n)} className={`text-2xl transition-transform hover:scale-110 ${n<=rating?'text-[var(--forest)]':'text-[var(--grey-light)]'}`}>★</button>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-[9px] uppercase tracking-[2.5px] text-[var(--grey-light)] mb-2 font-[Jost] font-medium">Your Review</label>
        <textarea rows={4} required className="input-underline resize-none"
          placeholder="Share your experience working with this seller..."
          value={comment} onChange={e => setComment(e.target.value)}/>
      </div>
      <Button size="lg" className="w-full" disabled={comment.length < 5} loading={loading} onClick={handleSubmit}>
        Submit Review
      </Button>
    </div>
  )
}

function RequirementsForm({ onSubmit, loading }: { onSubmit: (val: string) => void, loading: boolean }) {
  const [text, setText] = useState('')
  return (
    <div className="space-y-5">
      <p className="text-[13px] text-[var(--grey)] font-[Jost] font-light leading-relaxed">
        Provide instructions, technical specs, or files (via link) that the seller needs to start.
      </p>
      <textarea rows={6} required className="input-underline resize-none" 
        placeholder="Type your requirements here (min 10 chars)..."
        value={text} onChange={e => setText(e.target.value)}/>
      <Button size="lg" className="w-full" disabled={text.length < 10} loading={loading} onClick={() => onSubmit(text)}>
        <Send size={13}/> Submit & Start Project
      </Button>
    </div>
  )
}
