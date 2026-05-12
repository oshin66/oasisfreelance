'use client'
import { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'

type BaseProps = {
  label?: string
  hint?: string
  error?: string
}

export function Input(props: InputHTMLAttributes<HTMLInputElement> & BaseProps) {
  const { label, hint, error, className = '', ...rest } = props
  return (
    <label className="block">
      {label && <span className="block text-[10px] uppercase tracking-[2px] text-[var(--grey-light)] mb-2">{label}</span>}
      <input
        {...rest}
        className={`w-full px-3 py-2.5 border border-[var(--line)] bg-white/70 rounded-[10px] outline-none focus:border-[var(--forest)] transition-colors text-[14px] ${className}`}
      />
      {hint && !error && <span className="block text-[11px] text-[var(--grey-light)] mt-1">{hint}</span>}
      {error && <span className="block text-[11px] text-red-600 mt-1">{error}</span>}
    </label>
  )
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement> & BaseProps) {
  const { label, hint, error, className = '', ...rest } = props
  return (
    <label className="block">
      {label && <span className="block text-[10px] uppercase tracking-[2px] text-[var(--grey-light)] mb-2">{label}</span>}
      <textarea
        {...rest}
        className={`w-full px-3 py-2.5 border border-[var(--line)] bg-white/70 rounded-[10px] outline-none focus:border-[var(--forest)] transition-colors text-[14px] ${className}`}
      />
      {hint && !error && <span className="block text-[11px] text-[var(--grey-light)] mt-1">{hint}</span>}
      {error && <span className="block text-[11px] text-red-600 mt-1">{error}</span>}
    </label>
  )
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement> & BaseProps & { children: ReactNode }) {
  const { label, hint, error, className = '', children, ...rest } = props
  return (
    <label className="block">
      {label && <span className="block text-[10px] uppercase tracking-[2px] text-[var(--grey-light)] mb-2">{label}</span>}
      <select
        {...rest}
        className={`w-full px-3 py-2.5 border border-[var(--line)] bg-white/70 rounded-[10px] outline-none focus:border-[var(--forest)] transition-colors text-[14px] ${className}`}
      >
        {children}
      </select>
      {hint && !error && <span className="block text-[11px] text-[var(--grey-light)] mt-1">{hint}</span>}
      {error && <span className="block text-[11px] text-red-600 mt-1">{error}</span>}
    </label>
  )
}
