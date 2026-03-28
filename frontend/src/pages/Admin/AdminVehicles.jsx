/**
 * ADMIN VEHICLES PAGE
 * Add / Edit / Delete vehicles with full form
 */

import React, { useState, useEffect } from 'react'
import { vehicleAPI } from '../../services/api'
import { AdminLayout } from './AdminDashboard'
import toast from 'react-hot-toast'

// ── Vehicle Form Modal ─────────────────────────
function VehicleModal({ vehicle, onClose, onSave }) {
  const isEdit = !!vehicle?._id
  const [form, setForm] = useState({
    name:         vehicle?.name         || '',
    brand:        vehicle?.brand        || '',
    type:         vehicle?.type         || 'car',
    fuelType:     vehicle?.fuelType     || 'petrol',
    transmission: vehicle?.transmission || 'manual',
    pricePerDay:  vehicle?.pricePerDay  || '',
    seats:        vehicle?.seats        || 5,
    city:         vehicle?.city         || '',
    description:  vehicle?.description  || '',
    images:       vehicle?.images?.join('\n') || '',
    features:     vehicle?.features?.join(', ') || '',
    mileage:      vehicle?.mileage      || '',
    year:         vehicle?.year         || new Date().getFullYear(),
    licensePlate: vehicle?.licensePlate || '',
    isAvailable:  vehicle?.isAvailable !== false,
  })
  const [saving, setSaving] = useState(false)

  const handleChange = e => {
    const { name, value, type: t, checked } = e.target
    setForm(p => ({ ...p, [name]: t === 'checkbox' ? checked : value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        ...form,
        pricePerDay: Number(form.pricePerDay),
        seats:       Number(form.seats),
        year:        Number(form.year),
        images:      form.images.split('\n').map(s => s.trim()).filter(Boolean),
        features:    form.features.split(',').map(s => s.trim()).filter(Boolean),
      }
      if (isEdit) {
        await vehicleAPI.update(vehicle._id, payload)
        toast.success('Vehicle updated!')
      } else {
        await vehicleAPI.create(payload)
        toast.success('Vehicle added!')
      }
      onSave()
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-dark-800 border border-white/10 rounded-2xl
                      w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-dark-800 border-b border-white/5 px-6 py-4 flex justify-between items-center">
          <h3 className="font-display font-bold text-white text-lg">
            {isEdit ? '✏️ Edit Vehicle' : '➕ Add New Vehicle'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Vehicle Name *</label>
              <input name="name" value={form.name} onChange={handleChange}
                className="input text-sm" required placeholder="Swift Dezire" />
            </div>
            <div>
              <label className="label">Brand *</label>
              <input name="brand" value={form.brand} onChange={handleChange}
                className="input text-sm" required placeholder="Maruti Suzuki" />
            </div>
            <div>
              <label className="label">Type *</label>
              <select name="type" value={form.type} onChange={handleChange} className="input text-sm">
                {['car','suv','bike','scooter','van','truck'].map(t => (
                  <option key={t} value={t} className="capitalize">{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Fuel Type *</label>
              <select name="fuelType" value={form.fuelType} onChange={handleChange} className="input text-sm">
                {['petrol','diesel','electric','hybrid','cng'].map(f => (
                  <option key={f} value={f} className="capitalize">{f}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Transmission</label>
              <select name="transmission" value={form.transmission} onChange={handleChange} className="input text-sm">
                <option value="manual">Manual</option>
                <option value="automatic">Automatic</option>
              </select>
            </div>
            <div>
              <label className="label">Price / Day (₹) *</label>
              <input type="number" name="pricePerDay" value={form.pricePerDay} onChange={handleChange}
                className="input text-sm" required min="0" placeholder="1200" />
            </div>
            <div>
              <label className="label">Seats</label>
              <input type="number" name="seats" value={form.seats} onChange={handleChange}
                className="input text-sm" min="1" max="15" />
            </div>
            <div>
              <label className="label">Year</label>
              <input type="number" name="year" value={form.year} onChange={handleChange}
                className="input text-sm" min="2000" max="2025" />
            </div>
            <div>
              <label className="label">City *</label>
              <input name="city" value={form.city} onChange={handleChange}
                className="input text-sm" required placeholder="Mumbai" />
            </div>
            <div>
              <label className="label">License Plate</label>
              <input name="licensePlate" value={form.licensePlate} onChange={handleChange}
                className="input text-sm" placeholder="MH 01 AB 1234" />
            </div>
            <div>
              <label className="label">Mileage</label>
              <input name="mileage" value={form.mileage} onChange={handleChange}
                className="input text-sm" placeholder="22 km/l" />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input type="checkbox" name="isAvailable" id="isAvail"
                checked={form.isAvailable} onChange={handleChange}
                className="accent-orange-500 w-4 h-4" />
              <label htmlFor="isAvail" className="text-sm text-gray-300">Available for booking</label>
            </div>
          </div>

          <div>
            <label className="label">Description *</label>
            <textarea name="description" value={form.description} onChange={handleChange}
              className="input resize-none text-sm" rows={3} required
              placeholder="Describe the vehicle..." />
          </div>

          <div>
            <label className="label">Image URLs (one per line)</label>
            <textarea name="images" value={form.images} onChange={handleChange}
              className="input resize-none text-sm font-mono" rows={3}
              placeholder="https://images.unsplash.com/photo-...&#10;https://images.unsplash.com/photo-..." />
            <p className="text-xs text-gray-600 mt-1">Use Unsplash URLs for best results</p>
          </div>

          <div>
            <label className="label">Features (comma-separated)</label>
            <input name="features" value={form.features} onChange={handleChange}
              className="input text-sm" placeholder="AC, Bluetooth, Power Windows, Sunroof" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? '⏳ Saving...' : isEdit ? 'Update Vehicle' : 'Add Vehicle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────
export default function AdminVehicles() {
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading]   = useState(true)
  const [modal, setModal]       = useState(null) // null | 'new' | vehicleObj
  const [search, setSearch]     = useState('')

  const load = () => {
    vehicleAPI.getAll({ limit: 100 })
      .then(r => setVehicles(r.data.vehicles))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return
    try {
      await vehicleAPI.delete(id)
      setVehicles(prev => prev.filter(v => v._id !== id))
      toast.success('Vehicle deleted.')
    } catch { toast.error('Delete failed.') }
  }

  const filtered = vehicles.filter(v =>
    v.name.toLowerCase().includes(search.toLowerCase()) ||
    v.brand.toLowerCase().includes(search.toLowerCase()) ||
    v.city.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <AdminLayout title="🚗 Vehicles">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">🔍</span>
          <input placeholder="Search vehicles..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="input pl-9 text-sm" />
        </div>
        <button onClick={() => setModal('new')} className="btn-primary text-sm">
          ➕ Add Vehicle
        </button>
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
                  <th className="px-4 py-3 font-medium">Vehicle</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">City</th>
                  <th className="px-4 py-3 font-medium">Price/Day</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Rating</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filtered.map(v => (
                  <tr key={v._id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img src={v.images?.[0] || ''} alt={v.name}
                          onError={e => { e.target.style.display = 'none' }}
                          className="w-10 h-8 object-cover rounded-lg flex-shrink-0" />
                        <div>
                          <p className="font-medium text-white">{v.name}</p>
                          <p className="text-xs text-gray-500">{v.brand}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-400 capitalize">{v.type}</td>
                    <td className="px-4 py-3 text-gray-400">{v.city}</td>
                    <td className="px-4 py-3 text-primary-400 font-semibold">₹{v.pricePerDay?.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={v.isAvailable ? 'badge-green' : 'badge-red'}>
                        {v.isAvailable ? '✅ Available' : '❌ Unavailable'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400">
                      ⭐ {v.rating?.toFixed(1) || 'N/A'} ({v.reviewCount})
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => setModal(v)}
                          className="text-xs px-3 py-1.5 rounded-lg bg-dark-600 hover:bg-dark-500
                                     text-gray-300 transition-colors">
                          ✏️ Edit
                        </button>
                        <button onClick={() => handleDelete(v._id, v.name)}
                          className="text-xs px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20
                                     text-red-400 transition-colors">
                          🗑️ Del
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filtered.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No vehicles found
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal */}
      {modal && (
        <VehicleModal
          vehicle={modal === 'new' ? null : modal}
          onClose={() => setModal(null)}
          onSave={load}
        />
      )}
    </AdminLayout>
  )
}
