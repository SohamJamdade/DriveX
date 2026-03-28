/**
 * UI COMPONENTS
 * Reusable building blocks used across the app
 */

import React from 'react'

// ─── Full-Page Loading Screen ─────────────────
export default function LoadingScreen() {
  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-2 border-primary-500/20 border-t-primary-500
                        rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-500 text-sm animate-pulse">Loading DriveX...</p>
      </div>
    </div>
  )
}

// ─── Inline Spinner ───────────────────────────
export function Spinner({ size = 'md', className = '' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' }
  return (
    <div className={`${sizes[size]} border-2 border-primary-500/20 border-t-primary-500
                    rounded-full animate-spin ${className}`} />
  )
}

// ─── Star Rating Display ──────────────────────
export function StarRating({ rating = 0, max = 5, size = 'sm' }) {
  const sizes = { sm: 'w-3.5 h-3.5', md: 'w-4 h-4', lg: 'w-5 h-5' }
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }, (_, i) => (
        <svg key={i} className={`${sizes[size]} ${i < Math.round(rating) ? 'star-filled' : 'star-empty'}`}
          viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  )
}

// ─── Skeleton Card ────────────────────────────
export function VehicleCardSkeleton() {
  return (
    <div className="card p-0 overflow-hidden">
      <div className="skeleton h-48 w-full rounded-none" />
      <div className="p-4 space-y-3">
        <div className="skeleton h-4 w-3/4" />
        <div className="skeleton h-3 w-1/2" />
        <div className="flex gap-2">
          <div className="skeleton h-6 w-16 rounded-full" />
          <div className="skeleton h-6 w-16 rounded-full" />
        </div>
        <div className="flex justify-between items-center pt-2">
          <div className="skeleton h-5 w-24" />
          <div className="skeleton h-9 w-24 rounded-xl" />
        </div>
      </div>
    </div>
  )
}

// ─── Empty State ──────────────────────────────
export function EmptyState({ icon = '🔍', title, message, action }) {
  return (
    <div className="text-center py-20">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-500 text-sm mb-6 max-w-xs mx-auto">{message}</p>
      {action}
    </div>
  )
}

// ─── Status Badge ─────────────────────────────
export function StatusBadge({ status }) {
  const map = {
    confirmed:  { cls: 'badge-blue',   icon: '🔵', label: 'Confirmed' },
    active:     { cls: 'badge-green',  icon: '🟢', label: 'Active' },
    completed:  { cls: 'badge-gray',   icon: '✅', label: 'Completed' },
    cancelled:  { cls: 'badge-red',    icon: '❌', label: 'Cancelled' },
    pending:    { cls: 'badge-orange', icon: '⏳', label: 'Pending' },
  }
  const { cls, icon, label } = map[status] || map.pending
  return (
    <span className={cls}>
      {icon} {label}
    </span>
  )
}

// ─── Section Header ───────────────────────────
export function SectionHeader({ label, title, subtitle }) {
  return (
    <div className="text-center mb-12">
      {label && (
        <span className="inline-block text-xs font-semibold uppercase tracking-widest
                         text-primary-500 bg-primary-500/10 px-3 py-1 rounded-full mb-3">
          {label}
        </span>
      )}
      <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-3">{title}</h2>
      {subtitle && <p className="text-gray-400 max-w-2xl mx-auto">{subtitle}</p>}
    </div>
  )
}
