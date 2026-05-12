'use client'
import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Grid3X3, List, SlidersHorizontal, RefreshCw, Waves, Sparkles } from 'lucide-react'
import { motion, useScroll, useSpring, useTransform } from 'framer-motion'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import GigCard from '@/components/gig/GigCard'
import FilterSidebar from '@/components/gig/FilterSidebar'
import type { Gig } from '@/types'

interface Filters {
  category: string
  techStack: string[]
  budgetMin: number
  budgetMax: number
  deliveryDays: number
}

const DEFAULT: Filters = {
  category: 'All',
  techStack: [],
  budgetMin: 0,
  budgetMax: 100000,
  deliveryDays: 0
}

const SORT_OPTIONS = ['Newest', 'Best Rated', 'Lowest Price', 'Highest Price']

export default function BrowsePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[var(--paper)] flex items-center justify-center">
        <RefreshCw size={24} className="animate-spin text-[var(--grey-light)]" />
      </div>
    }>
      <BrowseInner />
    </Suspense>
  )
}

function BrowseInner() {
  const searchParams = useSearchParams()
  const searchQuery  = searchParams.get('search') ?? ''

  const [filters, setFilters] = useState<Filters>(DEFAULT)
  const [sort, setSort]       = useState('Newest')
  const [gigs, setGigs]       = useState<Gig[]>([])
  const [loading, setLoading] = useState(true)
  const [mobileFilter, setMobileFilter] = useState(false)
  const [view, setView] = useState<'grid'|'list'>('grid')
  const { scrollYProgress } = useScroll()
  const progressScaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 24, mass: 0.2 })
  const headerLift = useTransform(scrollYProgress, [0, 0.2], [0, -18])
  const bubbleY = useTransform(scrollYProgress, [0, 1], [0, -80])

  const fetchGigs = useCallback(async () => {
    setLoading(true)
    try {
      const sp = new URLSearchParams()
      if (filters.category !== 'All') sp.append('category', filters.category)
      if (filters.techStack.length)   sp.append('techStack', filters.techStack.join(','))
      if (filters.budgetMin > 0)      sp.append('budgetMin', String(filters.budgetMin))
      if (filters.budgetMax < 100000) sp.append('budgetMax', String(filters.budgetMax))
      if (filters.deliveryDays > 0)   sp.append('deliveryDays', String(filters.deliveryDays))
      if (searchQuery)                sp.append('search', searchQuery)
      
      const sortVal = 
        sort === 'Best Rated'   ? 'rating' :
        sort === 'Lowest Price' ? 'price_asc' :
        sort === 'Highest Price'? 'price_desc' : 'newest'
      sp.append('sort', sortVal)

      const res = await fetch(`/api/gigs?${sp.toString()}`)
      if (res.ok) {
        const d = await res.json()
        const incoming = (d.gigs || d.data?.gigs || []) as Gig[]
        setGigs(incoming)
      }
    } catch {
      // error
    } finally {
      setLoading(false)
    }
  }, [filters, sort, searchQuery])

  useEffect(() => {
    fetchGigs()
  }, [fetchGigs])

  return (
    <div className="min-h-screen bg-[var(--paper)]">
      <motion.div style={{ scaleX: progressScaleX }} className="fixed top-0 left-0 right-0 h-[2px] bg-[var(--forest)] z-[600] origin-left" />
      <Navbar/>
      <div className="pt-16">
        <section className="relative overflow-hidden border-b border-[var(--line)] bg-[var(--paper)]">
          <div className="absolute inset-0 coastal-hero-bg pointer-events-none" />
          <motion.div
            style={{ y: bubbleY }}
            className="absolute -right-20 top-0 w-[38vw] h-[38vw] max-w-[540px] max-h-[540px] rounded-full coastal-orb-strong pointer-events-none"
          />
          <motion.div
            animate={{ y: [0, -12, 0], x: [0, 8, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute left-[8%] top-[20%] w-4 h-4 rounded-full bg-[color:rgba(109,169,188,0.35)]"
          />
          <motion.div
            animate={{ y: [0, -10, 0], x: [0, -10, 0] }}
            transition={{ duration: 8.5, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
            className="absolute left-[14%] top-[38%] w-3 h-3 rounded-full bg-[color:rgba(236,220,201,0.55)]"
          />
          <div className="max-w-7xl mx-auto px-6 lg:px-16 py-14 relative">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55 }}
              className="flex items-center gap-2 text-[10px] uppercase tracking-[2.5px] text-[var(--forest-light)] mb-4"
            >
              <Waves size={14} />
              Coastal Discovery Feed
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 18, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.65, delay: 0.08 }}
              className="font-display text-[clamp(32px,5vw,54px)] leading-[1.05] text-[var(--charcoal)] font-light max-w-3xl"
            >
              Browse curated student services with a <em className="text-[var(--forest)]">fresh summer flow</em>.
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.16 }}
              className="text-[13px] text-[var(--grey)] mt-4 max-w-xl"
            >
              Filter quickly, compare clearly, and discover gigs in a smoother, editorial browsing experience.
            </motion.p>
          </div>
          <div className="h-[2px] bg-[linear-gradient(90deg,transparent,rgba(109,169,188,0.45),transparent)]" />
        </section>

        <div className="relative border-b border-[var(--line)] bg-[var(--paper-dark)] overflow-hidden">
          <div className="absolute inset-0 coastal-wash pointer-events-none" />
          <motion.div
            className="absolute -top-24 -right-14 w-72 h-72 rounded-full coastal-orb pointer-events-none"
            animate={{ x: [0, -14, 0], y: [0, 10, 0], scale: [1, 1.06, 1] }}
            transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div style={{ y: headerLift }} className="max-w-7xl mx-auto px-6 lg:px-16 py-5 flex items-center justify-between gap-4 flex-wrap relative">
            <div>
              <motion.h1
                initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: 0.55 }}
                className="font-display text-[26px] font-light text-[var(--charcoal)]"
              >
                {searchQuery ? `Search: ${searchQuery}` : filters.category === 'All' ? 'All Gigs' : filters.category}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-[11px] text-[var(--grey-light)] mt-0.5"
              >
                <span className="inline-flex items-center gap-1.5">
                  <Sparkles size={12} />
                  {gigs.length} services available
                </span>
              </motion.p>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="flex items-center gap-3"
            >
              <button onClick={()=>setMobileFilter(true)} className="md:hidden flex items-center gap-2 text-[11px] uppercase tracking-[1.5px] text-[var(--grey)] border border-[var(--line)] px-3 py-2">
                <SlidersHorizontal size={12}/> Filters
              </button>
              <select value={sort} onChange={e=>setSort(e.target.value)} className="text-[11px] bg-[var(--paper)] border-[0.5px] border-[var(--line)] px-3 py-2 text-[var(--grey)] outline-none cursor-pointer font-[Jost]">
                {SORT_OPTIONS.map(o=><option key={o}>{o}</option>)}
              </select>
              <div className="flex border-[0.5px] border-[var(--line)]">
                <button onClick={()=>setView('grid')} className={`p-2 transition-colors ${view==='grid'?'bg-[var(--forest)] text-[var(--paper)]':'text-[var(--grey)]'}`}><Grid3X3 size={14}/></button>
                <button onClick={()=>setView('list')} className={`p-2 border-l border-[var(--line)] transition-colors ${view==='list'?'bg-[var(--forest)] text-[var(--paper)]':'text-[var(--grey)]'}`}><List size={14}/></button>
              </div>
            </motion.div>
          </motion.div>
        </div>
        <div className="max-w-7xl mx-auto px-6 lg:px-16 py-10">
          <div className="flex gap-10">
            <div className="hidden md:block"><FilterSidebar filters={filters} onChange={setFilters}/></div>
            {mobileFilter && (
              <div className="fixed inset-0 z-[300] md:hidden">
                <div className="absolute inset-0 bg-black/40" onClick={()=>setMobileFilter(false)}/>
                <div className="absolute left-0 top-0 bottom-0 w-72 bg-[var(--paper)] p-6 overflow-y-auto animate-rise">
                  <FilterSidebar filters={filters} onChange={f=>{setFilters(f);setMobileFilter(false)}}/>
                </div>
              </div>
            )}
            <div className="flex-1 min-w-0">
              {loading ? (
                <div className="flex justify-center py-24"><RefreshCw size={24} className="animate-spin text-[var(--grey-light)]"/></div>
              ) : gigs.length===0 ? (
                <div className="flex flex-col items-center py-24 text-center">
                  <p className="font-display text-[22px] font-light text-[var(--grey)] mb-3">No gigs match your criteria</p>
                  <button onClick={()=>{setFilters(DEFAULT); window.location.href='/browse'}} className="text-[11px] uppercase tracking-[2px] text-[var(--forest)]">Clear All Filters</button>
                </div>
              ) : view==='grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  {gigs.map((gig, i)=>(
                    <motion.div
                      key={gig.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.45, delay: Math.min(i * 0.05, 0.35) }}
                      whileHover={{ y: -6 }}
                    >
                      <GigCard gig={gig}/>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col border-[0.5px] border-[var(--line)]">
                  {gigs.map((gig, i)=>(
                    <motion.a
                      key={gig.id}
                      href={`/gig/${gig.id}`}
                      initial={{ opacity: 0, x: -14 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.42, delay: Math.min(i * 0.045, 0.3) }}
                      className="flex gap-5 p-5 border-b border-[var(--line)] last:border-0 hover:bg-[var(--paper-dark)] transition-colors group"
                    >
                      <div className="w-32 h-20 bg-[var(--paper-dark)] border border-[var(--line)] shrink-0 flex items-center justify-center opacity-40">
                        <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><path d="M14 2L26 8v12l-12 6L2 20V8z" stroke="var(--forest)" strokeWidth="0.8"/></svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-display text-[17px] font-light group-hover:text-[var(--forest)] transition-colors mb-1 line-clamp-1">{gig.title}</h3>
                        <p className="text-[12px] text-[var(--grey)] line-clamp-2 mb-2">{gig.description}</p>
                        <div className="flex items-center gap-3 text-[10px] text-[var(--grey-light)] uppercase tracking-[1px]">
                          <span>{gig.category}</span><span>·</span><span>{gig.deliveryDays}d</span><span>·</span><span>★{gig.rating}</span>
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <div className="text-[9px] uppercase tracking-[1.5px] text-[var(--grey-light)] mb-1">From</div>
                        <div className="font-display text-[22px] font-light text-[var(--forest)]">₹{gig.basicPrice.toLocaleString()}</div>
                      </div>
                    </motion.a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  )
}
