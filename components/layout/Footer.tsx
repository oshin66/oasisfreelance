import Link from 'next/link'

const links = {
  'Web Development': { cat: 'Web Dev', items: ['Next.js Sites', 'API Development', 'React Apps', 'Backend Forge'] },
  'AI & Automation': { cat: 'AI & ML', items: ['RAG Chatbots', 'LLM Agents', 'Scrapers & Bots', 'Fine-tuning'] },
  'Data Science':    { cat: 'Data Science', items: ['Data Analysis', 'Visualizations', 'Stock Prediction', 'Cleaning'] },
  'CS & Scripts':    { cat: 'CS Projects', items: ['DSA Solutions', 'Compiler Design', 'OS Simulations', 'Python Scripts'] },
}

export default function Footer() {
  return (
    <footer className="border-t border-[var(--line)] glass-surface-soft mt-24">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 relative overflow-hidden rounded-md border border-[var(--line)]">
                <img src="/logo.png" alt="Craftsmanship Oasis" className="w-full h-full object-cover" />
              </div>
              <span className="font-display text-[13px] tracking-[2px] uppercase text-[var(--forest)]">C·Oasis</span>
            </div>
            <p className="text-[12px] text-[var(--grey)] leading-relaxed max-w-[180px]">
              The boutique tech forge where student engineers build for brands.
            </p>
            <div className="flex gap-3 mt-5">
              {['GitHub', 'X', 'IG'].map(s => (
                <a key={s} href="#" className="text-[9px] tracking-[1.5px] text-[var(--grey-light)] hover:text-[var(--forest)] uppercase transition-colors">{s}</a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(links).map(([title, data]) => (
            <div key={title}>
              <h4 className="text-[9px] tracking-[3px] uppercase text-[var(--forest)] mb-4 font-medium">{title}</h4>
              <ul className="flex flex-col gap-2">
                {data.items.map(item => (
                  <li key={item}>
                    <Link 
                      href={`/browse?category=${encodeURIComponent(data.cat)}&search=${encodeURIComponent(item)}`} 
                      className="text-[12px] text-[var(--grey)] hover:text-[var(--forest)] transition-colors"
                    >
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-[var(--line)] mt-12 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-[11px] text-[var(--grey-light)] tracking-wide">© 2025 Craftsmanship Oasis</p>
          <div className="flex gap-5">
            {['Privacy', 'Terms', 'Support'].map(l => (
              <a key={l} href="#" className="text-[11px] text-[var(--grey-light)] hover:text-[var(--forest)] uppercase tracking-[1.5px] transition-colors">{l}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
