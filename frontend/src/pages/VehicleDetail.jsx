/**
 * VEHICLE DETAIL PAGE
 * Full vehicle info, image gallery, live availability, booking CTA, and reviews
 */

import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { vehicleAPI, reviewAPI, bookingAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { StarRating, StatusBadge } from '../components/ui/LoadingScreen'
import toast from 'react-hot-toast'

const FUEL_ICONS  = { petrol: '⛽', diesel: '🛢️', electric: '⚡', hybrid: '🌿', cng: '💨' }
const TYPE_ICONS  = { car: '🚗', bike: '🏍️', suv: '🚙', van: '🚐', truck: '🚛', scooter: '🛵' }

// ── Image Gallery ─────────────────────────────
function Gallery({ images, name }) {
  const [active, setActive] = useState(0)
  const fallback = `https://placehold.co/800x500/1a1a27/f97316?text=${encodeURIComponent(name)}`

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div className="relative rounded-2xl overflow-hidden h-72 md:h-96 bg-dark-700">
        <img
          src={images?.[active] || fallback}
          alt={name}
          onError={e => { e.target.src = fallback }}
          className="w-full h-full object-cover transition-all duration-500"
        />
      </div>
      {/* Thumbnails */}
      {images?.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button key={i} onClick={() => setActive(i)}
              className={`flex-shrink-0 w-20 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                active === i ? 'border-primary-500' : 'border-transparent opacity-60 hover:opacity-100'
              }`}>
              <img src={img} alt={`View ${i+1}`} onError={e => {e.target.src=fallback}}
                className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Review Item ────────────────────────────────
function ReviewItem({ review, onDelete, currentUserId }) {
  return (
    <div className="card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary-500/20 flex items-center justify-center text-sm font-bold text-primary-400">
            {review.user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{review.user?.name}</p>
            <p className="text-xs text-gray-500">
              {new Date(review.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StarRating rating={review.rating} size="sm" />
          <span className="text-xs text-gray-400">{review.rating}/5</span>
          {currentUserId === review.user?._id && (
            <button onClick={() => onDelete(review._id)} className="text-red-400/60 hover:text-red-400 text-xs ml-1">✕</button>
          )}
        </div>
      </div>
      <p className="text-sm text-gray-400 mt-3 leading-relaxed">{review.comment}</p>
    </div>
  )
}

// ── Write Review Form ──────────────────────────
function ReviewForm({ vehicleId, onSuccess }) {
  const [rating, setRating]   = useState(5)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [hover, setHover]     = useState(0)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!comment.trim()) return toast.error('Please write a comment.')
    setLoading(true)
    try {
      await reviewAPI.create(vehicleId, { rating, comment })
      toast.success('Review posted! ⭐')
      setComment('')
      setRating(5)
      onSuccess()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post review.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card p-5 space-y-4">
      <h4 className="font-semibold text-white">Write a Review</h4>
      {/* Star picker */}
      <div className="flex items-center gap-1">
        {[1,2,3,4,5].map(star => (
          <button key={star} type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            className="text-2xl transition-transform hover:scale-110">
            <span className={(hover || rating) >= star ? 'star-filled' : 'star-empty'}>★</span>
          </button>
        ))}
        <span className="text-sm text-gray-400 ml-2">{rating}/5</span>
      </div>
      <textarea
        value={comment}
        onChange={e => setComment(e.target.value)}
        placeholder="Share your experience with this vehicle..."
        rows={3}
        className="input resize-none"
        maxLength={500}
      />
      <div className="flex justify-between items-center">
        <span className="text-xs text-gray-600">{comment.length}/500</span>
        <button type="submit" disabled={loading} className="btn-primary text-sm px-5 py-2">
          {loading ? '⏳ Posting...' : 'Post Review'}
        </button>
      </div>
    </form>
  )
}

// ── Main Component ─────────────────────────────
export default function VehicleDetail() {
  const { id }       = useParams()
  const navigate     = useNavigate()
  const { user, isLoggedIn, toggleWishlistLocally } = useAuth()

  const [vehicle, setVehicle]     = useState(null)
  const [reviews, setReviews]     = useState([])
  const [loading, setLoading]     = useState(true)
  const [wishloading, setWish]    = useState(false)
  const [checkDates, setCheckDates] = useState({ start: '', end: '' })
  const [availability, setAvail]  = useState(null)
  const [checkingAvail, setCheckingAvail] = useState(false)

  const isWishlisted = user?.wishlist?.includes(id)

  const load = async () => {
    try {
      const [vRes, rRes] = await Promise.all([
        vehicleAPI.getOne(id),
        reviewAPI.getForVehicle(id),
      ])
      setVehicle(vRes.data.vehicle)
      setReviews(rRes.data.reviews)
    } catch {
      toast.error('Vehicle not found.')
      navigate('/vehicles')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [id])

  const handleWishlist = async () => {
    if (!isLoggedIn) return navigate('/login')
    setWish(true)
    try {
      await vehicleAPI.toggleWishlist(id)
      toggleWishlistLocally(id)
      toast.success(isWishlisted ? 'Removed from wishlist' : '❤️ Added to wishlist')
    } catch { toast.error('Failed.') }
    finally { setWish(false) }
  }

  const handleCheckAvailability = async () => {
    if (!checkDates.start || !checkDates.end) return toast.error('Select both dates.')
    setCheckingAvail(true)
    try {
      const res = await bookingAPI.checkAvailability(id, {
        startDate: checkDates.start,
        endDate: checkDates.end,
      })
      setAvail(res.data.isAvailable)
    } catch { toast.error('Check failed.') }
    finally { setCheckingAvail(false) }
  }

  const handleDeleteReview = async (reviewId) => {
    try {
      await reviewAPI.delete(reviewId)
      setReviews(prev => prev.filter(r => r._id !== reviewId))
      toast.success('Review deleted.')
      load()
    } catch { toast.error('Failed to delete.') }
  }

  // Price calc for selected dates
  const calcDays = () => {
    if (!checkDates.start || !checkDates.end) return 0
    const diff = (new Date(checkDates.end) - new Date(checkDates.start)) / (1000*60*60*24)
    return diff > 0 ? Math.ceil(diff) : 0
  }
  const days = calcDays()
  const totalPrice = days * (vehicle?.pricePerDay || 0)

  if (loading) {
    return (
      <div className="min-h-screen pt-20 container-app py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="skeleton h-96 rounded-2xl" />
            <div className="skeleton h-8 w-1/2" />
            <div className="skeleton h-4 w-full" />
          </div>
          <div className="skeleton h-80 rounded-2xl" />
        </div>
      </div>
    )
  }

  if (!vehicle) return null

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="min-h-screen pt-20">
      <div className="container-app py-8">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link to="/vehicles" className="hover:text-primary-400 transition-colors">Vehicles</Link>
          <span>/</span>
          <span className="text-white">{vehicle.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── Left: Gallery + Details ─────── */}
          <div className="lg:col-span-2 space-y-6">
            <Gallery images={vehicle.images} name={vehicle.name} />

            {/* Header */}
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`w-2.5 h-2.5 rounded-full ${vehicle.isAvailable ? 'bg-green-400 animate-pulse-slow' : 'bg-red-400'}`} />
                  <span className={`text-xs font-semibold ${vehicle.isAvailable ? 'text-green-400' : 'text-red-400'}`}>
                    {vehicle.isAvailable ? 'Available Now' : 'Currently Booked'}
                  </span>
                </div>
                <h1 className="text-3xl font-display font-bold text-white">{vehicle.name}</h1>
                <p className="text-gray-400 mt-0.5">{vehicle.brand} · {vehicle.year} · {vehicle.city}</p>
              </div>

              <button onClick={handleWishlist} disabled={wishloading}
                className="flex items-center gap-2 btn-secondary text-sm">
                <span className="text-lg">{isWishlisted ? '❤️' : '🤍'}</span>
                {isWishlisted ? 'Saved' : 'Save'}
              </button>
            </div>

            {/* Rating */}
            {vehicle.reviewCount > 0 && (
              <div className="flex items-center gap-3">
                <StarRating rating={vehicle.rating} size="md" />
                <span className="text-white font-semibold">{vehicle.rating?.toFixed(1)}</span>
                <span className="text-gray-500 text-sm">({vehicle.reviewCount} review{vehicle.reviewCount !== 1 ? 's' : ''})</span>
                <span className="text-gray-600">·</span>
                <span className="text-gray-500 text-sm">🔥 {vehicle.bookingCount} bookings</span>
              </div>
            )}

            {/* Specs Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { icon: TYPE_ICONS[vehicle.type],    label: 'Type',         value: vehicle.type },
                { icon: FUEL_ICONS[vehicle.fuelType],label: 'Fuel',         value: vehicle.fuelType },
                { icon: '⚙️',                         label: 'Transmission', value: vehicle.transmission },
                { icon: '💺',                         label: 'Seats',        value: `${vehicle.seats} seats` },
                { icon: '📏',                         label: 'Mileage',      value: vehicle.mileage || 'N/A' },
                { icon: '📅',                         label: 'Year',         value: vehicle.year || 'N/A' },
                { icon: '📍',                         label: 'City',         value: vehicle.city },
                { icon: '🏷️',                         label: 'License',      value: vehicle.licensePlate || 'N/A' },
              ].map(({ icon, label, value }) => (
                <div key={label} className="card p-3 text-center">
                  <div className="text-xl mb-1">{icon}</div>
                  <div className="text-xs text-gray-500 capitalize">{label}</div>
                  <div className="text-sm font-semibold text-white capitalize mt-0.5">{value}</div>
                </div>
              ))}
            </div>

            {/* Description */}
            <div className="card p-5">
              <h3 className="font-semibold text-white mb-2">About This Vehicle</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{vehicle.description}</p>
            </div>

            {/* Features */}
            {vehicle.features?.length > 0 && (
              <div className="card p-5">
                <h3 className="font-semibold text-white mb-3">Features & Amenities</h3>
                <div className="flex flex-wrap gap-2">
                  {vehicle.features.map(f => (
                    <span key={f} className="badge-green text-xs">✓ {f}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            <div className="space-y-4">
              <h3 className="font-display font-bold text-white text-xl">
                Reviews {reviews.length > 0 && `(${reviews.length})`}
              </h3>

              {isLoggedIn && (
                <ReviewForm vehicleId={id} onSuccess={load} />
              )}

              {reviews.length === 0 ? (
                <div className="card p-8 text-center">
                  <p className="text-3xl mb-2">💬</p>
                  <p className="text-gray-500 text-sm">No reviews yet. Be the first!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {reviews.map(r => (
                    <ReviewItem key={r._id} review={r}
                      currentUserId={user?._id}
                      onDelete={handleDeleteReview} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Right: Booking Card ─────────── */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-24 space-y-5">
              {/* Price */}
              <div className="text-center pb-4 border-b border-white/5">
                <span className="text-4xl font-display font-bold text-white">
                  ₹{vehicle.pricePerDay?.toLocaleString()}
                </span>
                <span className="text-gray-400 text-sm">/day</span>
              </div>

              {/* Date Picker */}
              <div className="space-y-3">
                <div>
                  <label className="label">📅 Pickup Date</label>
                  <input type="date" min={today}
                    value={checkDates.start}
                    onChange={e => {
                      setCheckDates(p => ({ ...p, start: e.target.value }))
                      setAvail(null)
                    }}
                    className="input text-sm" />
                </div>
                <div>
                  <label className="label">📅 Return Date</label>
                  <input type="date"
                    min={checkDates.start || today}
                    value={checkDates.end}
                    onChange={e => {
                      setCheckDates(p => ({ ...p, end: e.target.value }))
                      setAvail(null)
                    }}
                    className="input text-sm" />
                </div>
              </div>

              {/* Price calculation */}
              {days > 0 && (
                <div className="bg-dark-700 rounded-xl p-4 space-y-2 text-sm">
                  <div className="flex justify-between text-gray-400">
                    <span>₹{vehicle.pricePerDay?.toLocaleString()} × {days} day{days>1?'s':''}</span>
                    <span className="text-white">₹{totalPrice?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Service fee</span>
                    <span className="text-green-400">Free</span>
                  </div>
                  <div className="h-px bg-white/5" />
                  <div className="flex justify-between font-bold text-white">
                    <span>Total</span>
                    <span className="text-primary-400">₹{totalPrice?.toLocaleString()}</span>
                  </div>
                </div>
              )}

              {/* Availability result */}
              {availability !== null && (
                <div className={`rounded-xl p-3 text-center text-sm font-semibold ${
                  availability
                    ? 'bg-green-500/15 text-green-400 border border-green-500/20'
                    : 'bg-red-500/15 text-red-400 border border-red-500/20'
                }`}>
                  {availability ? '✅ Available for selected dates!' : '❌ Not available — try different dates'}
                </div>
              )}

              {/* Action Buttons */}
              {days > 0 ? (
                <div className="space-y-2">
                  <button
                    onClick={handleCheckAvailability}
                    disabled={checkingAvail}
                    className="btn-secondary w-full">
                    {checkingAvail ? '⏳ Checking...' : '🔍 Check Availability'}
                  </button>

                  {vehicle.isAvailable && (
                    <button
                      onClick={() => {
                        if (!isLoggedIn) { navigate('/login'); return }
                        navigate(`/book/${vehicle._id}`, {
                          state: { startDate: checkDates.start, endDate: checkDates.end }
                        })
                      }}
                      className="btn-primary w-full text-base">
                      🚗 Book Now · ₹{totalPrice?.toLocaleString()}
                    </button>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => {
                    if (!isLoggedIn) { navigate('/login'); return }
                    navigate(`/book/${vehicle._id}`)
                  }}
                  disabled={!vehicle.isAvailable}
                  className="btn-primary w-full text-base disabled:opacity-40 disabled:cursor-not-allowed">
                  {vehicle.isAvailable ? '🚗 Book Now' : '❌ Not Available'}
                </button>
              )}

              {!isLoggedIn && (
                <p className="text-center text-xs text-gray-500">
                  <Link to="/login" className="text-primary-400 hover:underline">Login</Link> to book this vehicle
                </p>
              )}

              {/* Trust badges */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/5">
                {[['🔒', 'Secure'], ['📞', '24/7 Help'], ['💰', 'No fees']].map(([icon, label]) => (
                  <div key={label} className="text-center">
                    <div className="text-lg">{icon}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
