/**
 * BOOKING PAGE
 * Final booking confirmation with real-time price calculation
 * Prevents double booking by checking availability before confirming
 */

import React, { useState, useEffect } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { vehicleAPI, bookingAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function Booking() {
  const { id }       = useParams()
  const location     = useLocation()
  const navigate     = useNavigate()
  const { user }     = useAuth()

  const [vehicle, setVehicle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Pre-fill dates from VehicleDetail if passed via navigation state
  const [form, setForm] = useState({
    startDate: location.state?.startDate || '',
    endDate:   location.state?.endDate   || '',
    notes:     '',
  })

  const today = new Date().toISOString().split('T')[0]

  // Computed values
  const days = (() => {
    if (!form.startDate || !form.endDate) return 0
    const diff = (new Date(form.endDate) - new Date(form.startDate)) / (1000*60*60*24)
    return diff > 0 ? Math.ceil(diff) : 0
  })()
  const subtotal     = days * (vehicle?.pricePerDay || 0)
  const serviceFee   = 0 // Free for demo
  const totalAmount  = subtotal + serviceFee

  useEffect(() => {
    vehicleAPI.getOne(id)
      .then(r => setVehicle(r.data.vehicle))
      .catch(() => { toast.error('Vehicle not found'); navigate('/vehicles') })
      .finally(() => setLoading(false))
  }, [id])

  const handleChange = e => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Client-side validation
    if (!form.startDate || !form.endDate) return toast.error('Please select both dates.')
    if (days <= 0) return toast.error('End date must be after start date.')
    if (new Date(form.startDate) < new Date(today)) return toast.error('Start date cannot be in the past.')

    setSubmitting(true)
    try {
      // Create booking (server checks double-booking again)
      const res = await bookingAPI.create({
        vehicleId: id,
        startDate: form.startDate,
        endDate:   form.endDate,
        notes:     form.notes,
      })

      toast.success('🎉 Booking confirmed! Have a great trip!')
      navigate('/dashboard', { state: { newBooking: res.data.booking._id } })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary-500/20 border-t-primary-500 rounded-full animate-spin" />
      </div>
    )
  }

  const fallback = `https://placehold.co/600x300/1a1a27/f97316?text=${encodeURIComponent(vehicle?.name || '')}`

  return (
    <div className="min-h-screen pt-20 bg-dark-900">
      <div className="container-app py-10 max-w-4xl">

        {/* Back link */}
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-6">
          ← Back to vehicle
        </button>

        <h1 className="text-3xl font-display font-bold text-white mb-8">Confirm Booking</h1>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* ── Booking Form ───────────────── */}
          <div className="lg:col-span-3 space-y-6">

            {/* Renter Info (read-only from profile) */}
            <div className="card p-5">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                👤 Renter Details
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Full Name</label>
                  <div className="input bg-dark-600 text-gray-300 cursor-not-allowed">{user?.name}</div>
                </div>
                <div>
                  <label className="label">Email</label>
                  <div className="input bg-dark-600 text-gray-300 cursor-not-allowed text-sm truncate">{user?.email}</div>
                </div>
                <div className="col-span-2">
                  <label className="label">Phone</label>
                  <div className="input bg-dark-600 text-gray-300 cursor-not-allowed">
                    {user?.phone || 'Not set — update in dashboard'}
                  </div>
                </div>
              </div>
            </div>

            {/* Date Selection */}
            <form onSubmit={handleSubmit} className="card p-5 space-y-5">
              <h3 className="font-semibold text-white flex items-center gap-2">
                📅 Rental Dates
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Pickup Date *</label>
                  <input type="date" name="startDate" required
                    min={today}
                    value={form.startDate}
                    onChange={handleChange}
                    className="input text-sm" />
                </div>
                <div>
                  <label className="label">Return Date *</label>
                  <input type="date" name="endDate" required
                    min={form.startDate || today}
                    value={form.endDate}
                    onChange={handleChange}
                    className="input text-sm" />
                </div>
              </div>

              {/* Duration display */}
              {days > 0 && (
                <div className="flex items-center gap-2 bg-primary-500/10 border border-primary-500/20
                               rounded-xl px-4 py-2.5 text-sm">
                  <span className="text-primary-400">📆</span>
                  <span className="text-primary-300 font-medium">
                    {days} day{days > 1 ? 's' : ''} rental
                    · {new Date(form.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    {' → '}
                    {new Date(form.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
              )}

              {/* Pickup location */}
              <div>
                <label className="label">📍 Pickup Location</label>
                <div className="input bg-dark-600 text-gray-300">{vehicle?.city}</div>
                <p className="text-xs text-gray-600 mt-1">Vehicle will be ready at this location</p>
              </div>

              {/* Notes */}
              <div>
                <label className="label">📝 Special Requests (optional)</label>
                <textarea name="notes" value={form.notes} onChange={handleChange}
                  placeholder="Any special requests or notes for the team..."
                  rows={3} maxLength={500}
                  className="input resize-none text-sm" />
              </div>

              {/* Terms */}
              <div className="bg-dark-700/50 rounded-xl p-4 text-xs text-gray-500 space-y-1">
                <p>✅ Free cancellation up to 24 hours before pickup</p>
                <p>✅ Basic insurance included in price</p>
                <p>✅ Fuel policy: return with same level</p>
                <p>✅ Valid driving license required at pickup</p>
              </div>

              {/* Submit */}
              <button type="submit" disabled={submitting || days <= 0}
                className="btn-primary w-full text-base py-4 disabled:opacity-40 disabled:cursor-not-allowed">
                {submitting ? (
                  <span className="flex items-center gap-2 justify-center">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Confirming Booking...
                  </span>
                ) : (
                  days > 0
                    ? `🚗 Confirm Booking · ₹${totalAmount.toLocaleString()}`
                    : '🚗 Confirm Booking'
                )}
              </button>
            </form>
          </div>

          {/* ── Order Summary ──────────────── */}
          <div className="lg:col-span-2">
            <div className="card p-5 space-y-5 sticky top-24">
              <h3 className="font-semibold text-white">Order Summary</h3>

              {/* Vehicle card mini */}
              <div className="flex gap-3">
                <img
                  src={vehicle?.images?.[0] || fallback}
                  onError={e => { e.target.src = fallback }}
                  alt={vehicle?.name}
                  className="w-20 h-16 object-cover rounded-xl flex-shrink-0"
                />
                <div>
                  <p className="text-sm font-semibold text-white leading-tight">{vehicle?.name}</p>
                  <p className="text-xs text-gray-400">{vehicle?.brand}</p>
                  <p className="text-xs text-gray-500 mt-1">📍 {vehicle?.city}</p>
                </div>
              </div>

              {/* Specs chips */}
              <div className="flex flex-wrap gap-1.5">
                {[
                  vehicle?.type,
                  vehicle?.fuelType,
                  `${vehicle?.seats} seats`,
                  vehicle?.transmission,
                ].filter(Boolean).map(spec => (
                  <span key={spec} className="badge-gray text-xs capitalize">{spec}</span>
                ))}
              </div>

              {/* Price breakdown */}
              <div className="space-y-2 text-sm border-t border-white/5 pt-4">
                <div className="flex justify-between text-gray-400">
                  <span>Price per day</span>
                  <span className="text-white">₹{vehicle?.pricePerDay?.toLocaleString()}</span>
                </div>
                {days > 0 && (
                  <>
                    <div className="flex justify-between text-gray-400">
                      <span>Duration</span>
                      <span className="text-white">{days} day{days > 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>Subtotal</span>
                      <span className="text-white">₹{subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>Service fee</span>
                      <span className="text-green-400">Free</span>
                    </div>
                    <div className="flex justify-between font-bold text-white border-t border-white/5 pt-2">
                      <span>Total Amount</span>
                      <span className="text-primary-400 text-lg">₹{totalAmount.toLocaleString()}</span>
                    </div>
                  </>
                )}
              </div>

              {/* Security note */}
              <div className="flex items-center gap-2 text-xs text-gray-500 bg-dark-700 rounded-xl p-3">
                <span className="text-lg">🔒</span>
                <span>Secure booking. No payment required online — pay at pickup.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
