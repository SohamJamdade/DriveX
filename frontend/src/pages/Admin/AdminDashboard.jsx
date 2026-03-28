/**
 * ADMIN DASHBOARD
 * Stats overview + recent bookings summary
 */

import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { userAPI, bookingAPI, vehicleAPI } from '../../services/api'
import { StatusBadge } from '../../components/ui/LoadingScreen'
import toast from 'react-hot-toast'

// ── Admin Nav Sidebar ──────────────────────────
export function AdminLayout({ children, title }) {
  const navItems = [
    { to: '/admin',          icon: '📊', label: 'Overview' },
    { to: '/admin/vehicles', icon: '🚗', label: 'Vehicles' },
    { to: '/admin/bookings', icon: '📅', label: 'Bookings' },
    { to: '/admin/users',    icon: '👥', label: 'Users' },
    { to: '/',               icon: '↗️', label: 'View Site' },
  ]

  return (
    <div className="min-h-screen pt-16 flex">
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 bg-dark-800 border-r border-white/[0.06]
                        min-h-screen pt-6 hidden md:block">
        <div className="px-4 mb-6">
          <span className="text-xs font-semibold uppercase tracking-widest text-primary-500
                           bg-primary-500/10 px-3 py-1 rounded-full">
            ⚡ Admin Panel
          </span>
        </div>
        <nav className="px-2 space-y-1">
          {navItems.map(({ to, icon, label }) => (
            <Link key={to} to={to}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm
                         text-gray-400 hover:text-white hover:bg-white/5 transition-all">
              <span>{icon}</span>
              <span>{label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <div className="flex-1 p-6 md:p-8 overflow-auto">
        <h1 className="text-2xl font-display font-bold text-white mb-6">{title}</h1>
        {children}
      </div>
    </div>
  )
}

// ── Stat Card ──────────────────────────────────
function StatCard({ icon, label, value, sub, color = 'primary' }) {
  const colors = {
    primary: 'from-primary-500/20 to-primary-600/5 border-primary-500/20',
    green:   'from-green-500/20 to-green-600/5 border-green-500/20',
    blue:    'from-blue-500/20 to-blue-600/5 border-blue-500/20',
    purple:  'from-purple-500/20 to-purple-600/5 border-purple-500/20',
  }
  return (
    <div className={`card bg-gradient-to-br ${colors[color]} p-5`}>
      <div className="text-3xl mb-3">{icon}</div>
      <div className="text-2xl font-display font-bold text-white">{value}</div>
      <div className="text-sm text-gray-400 mt-0.5">{label}</div>
      {sub && <div className="text-xs text-gray-600 mt-1">{sub}</div>}
    </div>
  )
}

// ── Main Admin Dashboard ───────────────────────
export default function AdminDashboard() {
  const [stats, setStats]           = useState(null)
  const [recentBookings, setRecent] = useState([])
  const [loading, setLoading]       = useState(true)

  useEffect(() => {
    Promise.all([
      userAPI.getStats(),
      bookingAPI.getAll({ limit: 5 }),
    ])
    .then(([statsRes, bookingsRes]) => {
      setStats(statsRes.data.stats)
      setRecent(bookingsRes.data.bookings)
    })
    .catch(() => toast.error('Failed to load stats.'))
    .finally(() => setLoading(false))
  }, [])

  const bookingStatusMap = {}
  stats?.bookingsByStatus?.forEach(({ _id, count }) => { bookingStatusMap[_id] = count })

  return (
    <AdminLayout title="📊 Overview">
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="skeleton h-32 rounded-2xl" />)}
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard icon="👥" label="Total Users"    value={stats?.totalUsers || 0}     color="blue" />
            <StatCard icon="📅" label="Total Bookings" value={stats?.totalBookings || 0}  color="primary" />
            <StatCard icon="💰" label="Total Revenue"
              value={`₹${(stats?.totalRevenue || 0).toLocaleString()}`} color="green" />
            <StatCard icon="✅" label="Completed Trips"
              value={bookingStatusMap['completed'] || 0} color="purple" />
          </div>

          {/* Booking Status Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="card p-5 lg:col-span-2">
              <h3 className="font-semibold text-white mb-4">Booking Status Breakdown</h3>
              <div className="space-y-3">
                {[
                  ['confirmed', 'Confirmed', 'bg-blue-400'],
                  ['active',    'Active',    'bg-green-400'],
                  ['completed', 'Completed', 'bg-gray-400'],
                  ['cancelled', 'Cancelled', 'bg-red-400'],
                ].map(([status, label, color]) => {
                  const count = bookingStatusMap[status] || 0
                  const total = stats?.totalBookings || 1
                  const pct = Math.round((count / total) * 100)
                  return (
                    <div key={status}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400 capitalize">{label}</span>
                        <span className="text-white font-medium">{count} ({pct}%)</span>
                      </div>
                      <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Quick Links */}
            <div className="card p-5">
              <h3 className="font-semibold text-white mb-4">Quick Actions</h3>
              <div className="space-y-2">
                {[
                  { to: '/admin/vehicles', icon: '➕', label: 'Add New Vehicle' },
                  { to: '/admin/bookings', icon: '📋', label: 'View All Bookings' },
                  { to: '/admin/users',    icon: '👥', label: 'Manage Users' },
                  { to: '/vehicles',       icon: '🔍', label: 'Browse Listings' },
                ].map(({ to, icon, label }) => (
                  <Link key={to} to={to}
                    className="flex items-center gap-3 p-3 rounded-xl bg-dark-700
                               hover:bg-dark-600 transition-colors text-sm text-gray-300 hover:text-white">
                    <span>{icon}</span>
                    <span>{label}</span>
                    <span className="ml-auto text-gray-600">→</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Bookings */}
          <div className="card p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-white">Recent Bookings</h3>
              <Link to="/admin/bookings" className="text-xs text-primary-400 hover:text-primary-300">
                View all →
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-500 border-b border-white/5">
                    <th className="pb-3 font-medium">Customer</th>
                    <th className="pb-3 font-medium">Vehicle</th>
                    <th className="pb-3 font-medium">Dates</th>
                    <th className="pb-3 font-medium">Amount</th>
                    <th className="pb-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {recentBookings.map(b => (
                    <tr key={b._id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 text-white font-medium">{b.user?.name || 'N/A'}</td>
                      <td className="py-3 text-gray-400">{b.vehicle?.name || 'N/A'}</td>
                      <td className="py-3 text-gray-400 text-xs">
                        {new Date(b.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} →{' '}
                        {new Date(b.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </td>
                      <td className="py-3 text-primary-400 font-semibold">₹{b.totalAmount?.toLocaleString()}</td>
                      <td className="py-3"><StatusBadge status={b.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  )
}
