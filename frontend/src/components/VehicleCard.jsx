/**
 * VEHICLE CARD
 * Reusable card displayed in listings, search results, recommendations
 */

import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { vehicleAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { StarRating } from './ui/LoadingScreen'
import toast from 'react-hot-toast'

const FUEL_ICONS = { petrol: '⛽', diesel: '🛢️', electric: '⚡', hybrid: '🌿', cng: '💨' }
const TYPE_ICONS = { car: '🚗', bike: '🏍️', suv: '🚙', van: '🚐', truck: '🚛', scooter: '🛵' }

export default function VehicleCard({ vehicle, onWishlistChange }) {
  const { user, isLoggedIn, toggleWishlistLocally } = useAuth()
  const navigate = useNavigate()

  const isWishlisted = user?.wishlist?.includes(vehicle._id)
  const [wishloading, setWishloading] = useState(false)
  const [imgError, setImgError] = useState(false)

  const handleWishlist = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (!isLoggedIn) {
      toast.error('Please login to save vehicles.')
      navigate('/login')
      return
    }

    setWishloading(true)
    try {
      await vehicleAPI.toggleWishlist(vehicle._id)
      toggleWishlistLocally(vehicle._id)
      toast.success(isWishlisted ? 'Removed from wishlist' : '❤️ Added to wishlist')
      onWishlistChange?.()
    } catch {
      toast.error('Failed to update wishlist.')
    } finally {
      setWishloading(false)
    }
  }

  const fallbackImage = `https://placehold.co/400x240/1a1a27/f97316?text=${encodeURIComponent(vehicle.brand)}`

  return (
    <div className="card-hover group relative flex flex-col animate-in">
      {/* ── Image ── */}
      <div className="relative overflow-hidden h-48 bg-dark-700">
        <img
          src={imgError ? fallbackImage : (vehicle.images?.[0] || fallbackImage)}
          alt={vehicle.name}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-dark-900/60 to-transparent" />

        {/* Availability dot */}
        <div className={`absolute top-3 left-3 flex items-center gap-1.5
                        px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-sm
                        ${vehicle.isAvailable
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                          : 'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${vehicle.isAvailable ? 'bg-green-400 animate-pulse-slow' : 'bg-red-400'}`} />
          {vehicle.isAvailable ? 'Available' : 'Booked'}
        </div>

        {/* Wishlist button */}
        <button
          onClick={handleWishlist}
          disabled={wishloading}
          className="absolute top-3 right-3 w-8 h-8 rounded-full backdrop-blur-sm
                     flex items-center justify-center transition-all duration-200
                     bg-dark-900/60 hover:bg-dark-900/80 border border-white/10"
          aria-label="Toggle wishlist"
        >
          <span className="text-base">{isWishlisted ? '❤️' : '🤍'}</span>
        </button>

        {/* City badge */}
        <div className="absolute bottom-2 left-3 flex items-center gap-1 text-white/80 text-xs">
          <span>📍</span>
          <span>{vehicle.city}</span>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="p-4 flex flex-col flex-1">
        {/* Name + Brand */}
        <div className="mb-2">
          <h3 className="font-display font-semibold text-white text-base leading-tight group-hover:text-primary-300 transition-colors">
            {vehicle.name}
          </h3>
          <p className="text-gray-500 text-xs mt-0.5">{vehicle.brand}</p>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          <span className="badge-gray text-xs">
            {TYPE_ICONS[vehicle.type]} {vehicle.type}
          </span>
          <span className="badge-gray text-xs">
            {FUEL_ICONS[vehicle.fuelType]} {vehicle.fuelType}
          </span>
          <span className="badge-gray text-xs">
            👤 {vehicle.seats} seats
          </span>
          {vehicle.transmission && (
            <span className="badge-gray text-xs capitalize">{vehicle.transmission}</span>
          )}
        </div>

        {/* Rating */}
        {vehicle.reviewCount > 0 && (
          <div className="flex items-center gap-1.5 mb-3">
            <StarRating rating={vehicle.rating} />
            <span className="text-xs text-gray-400">
              {vehicle.rating?.toFixed(1)} ({vehicle.reviewCount})
            </span>
          </div>
        )}

        {/* Price + CTA */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/5">
          <div>
            <span className="text-xl font-display font-bold text-white">
              ₹{vehicle.pricePerDay?.toLocaleString()}
            </span>
            <span className="text-gray-500 text-xs">/day</span>
          </div>
          <Link
            to={`/vehicles/${vehicle._id}`}
            className="btn-primary text-xs px-4 py-2"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  )
}
