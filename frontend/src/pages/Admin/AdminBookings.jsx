/**
 * ADMIN BOOKINGS PAGE
 * View and manage all bookings with status filter
 */

import React, { useState, useEffect } from 'react'
import { bookingAPI } from '../../services/api'
import { AdminLayout } from './AdminDashboard'
import { StatusBadge } from '../../components/ui/LoadingScreen'
import toast from 'react-hot-toast'

export default function AdminBookings() {
  const [bookings, setBookings]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [filter, setFilter]       = useState('')
  const [total, setTotal]         = useState(0)
  const [revenue, setRevenue]     = useState(0)
  const [page, setPage]           = useState(1)
  const [totalPages, setTotalPgs] = useState(1)

  const load = (p = page, s = filter) => {
    setLoading(true)
    bookingAPI.getAll({ status: s, page: p, limit: 15 })
      .then(res => {
        setBookings(res.data.bookings)
        setTotal(res.data.total)
        setRevenue(res.data.stats?.totalRevenue || 0)
        setTotalPgs(res.data.totalPages)
      })
      .catch(() => toast.error('Failed to load bookings.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleFilterChange = (s) => {
    setFilter(s)
    setPage(1)
    load(1, s)
  }

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this booking?')) return
    try {
      await bookingAPI.cancel(id, 'Cancelled by admin')
      toast.success('Booking cancelled.')
      load()
    } catch { toast.error('Cancellation failed.') }
  }

  const statusFilters = ['', 'confirmed', 'active', 'completed', 'cancelled']

  return (
    <AdminLayout title="📅 Bookings">
      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total',     value: total,                       color: 'text-white' },
          { label: 'Revenue',   value: `₹${revenue.toLocaleString()}`, color: 'text-green-400' },
          { label: 'Showing',   value: bookings.length,              color: 'text-blue-400' },
          { label: 'Pages',     value: totalPages,                   color: 'text-primary-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card p-4 text-center">
            <div className={`text-xl font-display font-bold ${color}`}>{value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Status filter */}
      <div className="flex flex-wrap gap-2 mb-5">
        {statusFilters.map(s => (
          <button key={s} onClick={() => handleFilterChange(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all capitalize ${
              filter === s
                ? 'bg-primary-500 text-white'
                : 'bg-dark-700 text-gray-400 hover:bg-dark-600 border border-white/10'
            }`}>
            {s || 'All Statuses'}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3,4,5].map(i => <div key={i} className="skeleton h-16 rounded-xl" />)}
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-dark-700/50">
                <tr className="text-left text-xs text-gray-500">
                  <th className="px-4 py-3 font-medium">Customer</th>
                  <th className="px-4 py-3 font-medium">Vehicle</th>
                  <th className="px-4 py-3 font-medium">Dates</th>
                  <th className="px-4 py-3 font-medium">Days</th>
                  <th className="px-4 py-3 font-medium">Amount</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {bookings.map(b => (
                  <tr key={b._id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-white">{b.user?.name || 'N/A'}</p>
                      <p className="text-xs text-gray-500">{b.user?.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-white">{b.vehicle?.name || 'N/A'}</p>
                      <p className="text-xs text-gray-500">{b.vehicle?.type}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      <div>{new Date(b.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div>
                      <div>→ {new Date(b.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                    </td>
                    <td className="px-4 py-3 text-center text-white">{b.totalDays}d</td>
                    <td className="px-4 py-3 text-primary-400 font-bold">
                      ₹{b.totalAmount?.toLocaleString()}
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
                    <td className="px-4 py-3">
                      {['confirmed', 'active'].includes(b.status) && (
                        <button onClick={() => handleCancel(b._id)}
                          className="text-xs px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20
                                     text-red-400 transition-colors">
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {bookings.length === 0 && (
              <div className="text-center py-12 text-gray-500">No bookings found</div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 p-4 border-t border-white/5">
              <button disabled={page <= 1}
                onClick={() => { setPage(p => p-1); load(page-1) }}
                className="btn-secondary text-xs px-3 py-1.5 disabled:opacity-40">← Prev</button>
              <span className="text-sm text-gray-400 px-3 py-1.5">
                {page} / {totalPages}
              </span>
              <button disabled={page >= totalPages}
                onClick={() => { setPage(p => p+1); load(page+1) }}
                className="btn-secondary text-xs px-3 py-1.5 disabled:opacity-40">Next →</button>
            </div>
          )}
        </div>
      )}
    </AdminLayout>
  )
}
