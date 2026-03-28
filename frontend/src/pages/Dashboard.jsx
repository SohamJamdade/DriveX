/**
 * USER DASHBOARD
 * Shows booking history with status tracking + profile section
 */

import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { bookingAPI, authAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { StatusBadge, EmptyState, Spinner } from '../components/ui/LoadingScreen'
import toast from 'react-hot-toast'

// ── Booking Card ──────────────────────────────
function BookingCard({ booking, onCancel }) {
  const [cancelling, setCancelling] = useState(false)
  const v = booking.vehicle
  const fallback = `https://placehold.co/120x80/1a1a27/f97316?text=${encodeURIComponent(v?.name || 'Vehicle')}`

  const canCancel = ['confirmed', 'pending'].includes(booking.status)

  const handleCancel = async () => {
    if (!window.confirm('Cancel this booking?')) return
    setCancelling(true)
    try {
      await onCancel(booking._id)
    } finally {
      setCancelling(false)
    }
  }

  return (
    <div className="card p-5 hover:border-white/10 transition-all duration-200 animate-in">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Vehicle image */}
        <img
          src={v?.images?.[0] || fallback}
          alt={v?.name}
          onError={e => { e.target.src = fallback }}
          className="w-full sm:w-28 h-24 sm:h-20 object-cover rounded-xl flex-shrink-0"
        />

        {/* Details */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
            <div>
              <h4 className="font-semibold text-white leading-tight">{v?.name || 'Vehicle'}</h4>
              <p className="text-xs text-gray-500">{v?.brand} · {v?.city}</p>
            </div>
            <StatusBadge status={booking.status} />
          </div>

          {/* Date range */}
          <div className="flex flex-wrap gap-3 text-xs text-gray-400 mb-3">
            <span>📅 {new Date(booking.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            <span>→</span>
            <span>{new Date(booking.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            <span className="text-gray-600">·</span>
            <span>{booking.totalDays} day{booking.totalDays > 1 ? 's' : ''}</span>
          </div>

          {/* Price + Actions */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-lg font-display font-bold text-primary-400">
                ₹{booking.totalAmount?.toLocaleString()}
              </span>
              <span className="text-xs text-gray-500 ml-1">total</span>
            </div>
            <div className="flex gap-2">
              <Link to={`/vehicles/${v?._id}`}
                className="text-xs px-3 py-1.5 rounded-lg border border-white/10
                           text-gray-400 hover:text-white hover:border-white/20 transition-all">
                View Vehicle
              </Link>
              {canCancel && (
                <button onClick={handleCancel} disabled={cancelling}
                  className="btn-danger text-xs px-3 py-1.5">
                  {cancelling ? '⏳' : '✕'} Cancel
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Notes if any */}
      {booking.notes && (
        <div className="mt-3 pt-3 border-t border-white/5">
          <p className="text-xs text-gray-500">📝 {booking.notes}</p>
        </div>
      )}
    </div>
  )
}

// ── Profile Section ───────────────────────────
function ProfileSection() {
  const { user, updateUser } = useAuth()
  const [editing, setEditing]   = useState(false)
  const [form, setForm]         = useState({ name: user?.name || '', phone: user?.phone || '' })
  const [saving, setSaving]     = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await authAPI.updateProfile(form)
      updateUser(res.data.user)
      toast.success('Profile updated!')
      setEditing(false)
    } catch { toast.error('Update failed.') }
    finally { setSaving(false) }
  }

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-semibold text-white">My Profile</h3>
        {!editing
          ? <button onClick={() => setEditing(true)} className="btn-ghost text-xs">✏️ Edit</button>
          : (
            <div className="flex gap-2">
              <button onClick={() => setEditing(false)} className="btn-ghost text-xs">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary text-xs px-4 py-1.5">
                {saving ? '⏳' : 'Save'}
              </button>
            </div>
          )
        }
      </div>

      {/* Avatar */}
      <div className="flex items-center gap-4 mb-5">
        <div className="w-14 h-14 rounded-2xl bg-primary-500/20 flex items-center justify-center
                        text-2xl font-bold text-primary-400 border border-primary-500/20">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="font-semibold text-white">{user?.name}</p>
          <p className="text-xs text-gray-500">{user?.email}</p>
          <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block
            ${user?.role === 'admin'
              ? 'bg-primary-500/20 text-primary-400'
              : 'bg-blue-500/20 text-blue-400'}`}>
            {user?.role === 'admin' ? '⚡ Admin' : '👤 User'}
          </span>
        </div>
      </div>

      {/* Fields */}
      <div className="space-y-3">
        <div>
          <label className="label">Full Name</label>
          {editing
            ? <input className="input text-sm" value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
            : <div className="text-sm text-white bg-dark-700 rounded-xl px-4 py-3">{user?.name}</div>
          }
        </div>
        <div>
          <label className="label">Email</label>
          <div className="text-sm text-gray-400 bg-dark-700 rounded-xl px-4 py-3">{user?.email}</div>
        </div>
        <div>
          <label className="label">Phone</label>
          {editing
            ? <input className="input text-sm" value={form.phone} placeholder="+91 98765 43210"
                onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
            : <div className="text-sm text-white bg-dark-700 rounded-xl px-4 py-3">
                {user?.phone || <span className="text-gray-500">Not set</span>}
              </div>
          }
        </div>
        <div>
          <label className="label">Member Since</label>
          <div className="text-sm text-gray-400 bg-dark-700 rounded-xl px-4 py-3">
            {new Date(user?.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Dashboard Main ────────────────────────────
export default function Dashboard() {
  const location = useLocation()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading]   = useState(true)
  const [filter, setFilter]     = useState('all')
  const [activeTab, setActiveTab] = useState('bookings')

  useEffect(() => {
    bookingAPI.getMyBookings()
      .then(r => setBookings(r.data.bookings))
      .catch(() => toast.error('Failed to load bookings.'))
      .finally(() => setLoading(false))
  }, [])

  // Highlight new booking if coming from booking page
  useEffect(() => {
    if (location.state?.newBooking) {
      toast.success('🎉 Booking confirmed! Check your bookings.')
    }
  }, [])

  const handleCancel = async (bookingId) => {
    try {
      await bookingAPI.cancel(bookingId)
      setBookings(prev =>
        prev.map(b => b._id === bookingId ? { ...b, status: 'cancelled' } : b)
      )
      toast.success('Booking cancelled.')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cancellation failed.')
    }
  }

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter)

  const statusCounts = {
    all: bookings.length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    active: bookings.filter(b => b.status === 'active').length,
    completed: bookings.filter(b => b.status === 'completed').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
  }

  const totalSpent = bookings
    .filter(b => b.status !== 'cancelled')
    .reduce((sum, b) => sum + (b.totalAmount || 0), 0)

  return (
    <div className="min-h-screen pt-20">
      <div className="container-app py-8 max-w-5xl">
        <div className="mb-6">
          <h1 className="text-3xl font-display font-bold text-white">My Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">Manage your bookings and profile</p>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {[
            { label: 'Total Trips', value: bookings.length, icon: '🚗' },
            { label: 'Active Now',  value: statusCounts.active, icon: '🟢' },
            { label: 'Completed',   value: statusCounts.completed, icon: '✅' },
            { label: 'Total Spent', value: `₹${totalSpent.toLocaleString()}`, icon: '💰' },
          ].map(({ label, value, icon }) => (
            <div key={label} className="card p-4">
              <div className="text-2xl mb-1">{icon}</div>
              <div className="text-xl font-display font-bold text-white">{value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-dark-800 rounded-xl p-1 mb-6 w-fit border border-white/5">
          {[['bookings', '📋 Bookings'], ['profile', '👤 Profile']].map(([tab, label]) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab
                  ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
                  : 'text-gray-400 hover:text-white'
              }`}>
              {label}
            </button>
          ))}
        </div>

        {activeTab === 'bookings' ? (
          <>
            {/* Filter chips */}
            <div className="flex flex-wrap gap-2 mb-5">
              {Object.entries(statusCounts).map(([status, count]) => (
                <button key={status} onClick={() => setFilter(status)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all capitalize ${
                    filter === status
                      ? 'bg-primary-500 text-white'
                      : 'bg-dark-700 text-gray-400 hover:bg-dark-600 border border-white/10'
                  }`}>
                  {status} ({count})
                </button>
              ))}
            </div>

            {/* Booking list */}
            {loading ? (
              <div className="flex justify-center py-20"><Spinner size="lg" /></div>
            ) : filtered.length === 0 ? (
              <EmptyState
                icon="📋"
                title="No bookings found"
                message={filter === 'all' ? "You haven't booked any vehicles yet." : `No ${filter} bookings.`}
                action={filter === 'all' && (
                  <Link to="/vehicles" className="btn-primary">Browse Vehicles</Link>
                )}
              />
            ) : (
              <div className="space-y-4">
                {filtered.map(booking => (
                  <BookingCard key={booking._id} booking={booking} onCancel={handleCancel} />
                ))}
              </div>
            )}
          </>
        ) : (
          <ProfileSection />
        )}
      </div>
    </div>
  )
}
