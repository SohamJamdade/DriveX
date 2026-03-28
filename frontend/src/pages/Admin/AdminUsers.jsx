/**
 * ADMIN USERS PAGE
 * View and manage all registered users
 */

import React, { useState, useEffect } from 'react'
import { userAPI } from '../../services/api'
import { AdminLayout } from './AdminDashboard'
import toast from 'react-hot-toast'

export default function AdminUsers() {
  const [users, setUsers]     = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')
  const [total, setTotal]     = useState(0)

  const load = () => {
    userAPI.getAll({ search, limit: 50 })
      .then(res => { setUsers(res.data.users); setTotal(res.data.total) })
      .catch(() => toast.error('Failed to load users.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])
  useEffect(() => {
    const t = setTimeout(load, 400) // Debounce search
    return () => clearTimeout(t)
  }, [search])

  const handleToggleStatus = async (id, name, currentStatus) => {
    const action = currentStatus ? 'deactivate' : 'activate'
    if (!window.confirm(`${action} ${name}?`)) return
    try {
      await userAPI.toggleStatus(id)
      setUsers(prev => prev.map(u =>
        u._id === id ? { ...u, isActive: !u.isActive } : u
      ))
      toast.success(`User ${action}d.`)
    } catch { toast.error('Action failed.') }
  }

  return (
    <AdminLayout title="👥 Users">
      {/* Search */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">🔍</span>
          <input placeholder="Search by name or email..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="input pl-9 text-sm" />
        </div>
        <span className="text-sm text-gray-400">{total} total users</span>
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
                  <th className="px-4 py-3 font-medium">User</th>
                  <th className="px-4 py-3 font-medium">Phone</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Joined</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {users.map(u => (
                  <tr key={u._id} className={`hover:bg-white/[0.02] transition-colors ${!u.isActive ? 'opacity-50' : ''}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary-500/20 flex items-center justify-center
                                        text-primary-400 font-bold text-sm flex-shrink-0">
                          {u.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-white">{u.name}</p>
                          <p className="text-xs text-gray-500">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{u.phone || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={u.role === 'admin'
                        ? 'badge-orange text-xs'
                        : 'badge-blue text-xs'}>
                        {u.role === 'admin' ? '⚡ Admin' : '👤 User'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3">
                      <span className={u.isActive ? 'badge-green text-xs' : 'badge-red text-xs'}>
                        {u.isActive ? '✅ Active' : '❌ Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => handleToggleStatus(u._id, u.name, u.isActive)}
                          className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
                            u.isActive
                              ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400'
                              : 'bg-green-500/10 hover:bg-green-500/20 text-green-400'
                          }`}>
                          {u.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {users.length === 0 && (
              <div className="text-center py-12 text-gray-500">No users found</div>
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
