/**
 * WISHLIST PAGE
 * Shows vehicles the user has saved/hearted
 */

import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { authAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import VehicleCard from '../components/VehicleCard'
import { VehicleCardSkeleton, EmptyState } from '../components/ui/LoadingScreen'

export default function Wishlist() {
  const { updateUser } = useAuth()
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading]   = useState(true)

  const load = () => {
    authAPI.getMe()
      .then(res => {
        updateUser(res.data.user)
        setVehicles(res.data.user.wishlist || [])
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  return (
    <div className="min-h-screen pt-20">
      <div className="container-app py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-white">❤️ My Wishlist</h1>
          <p className="text-gray-400 text-sm mt-1">
            {loading ? 'Loading...' : `${vehicles.length} saved vehicle${vehicles.length !== 1 ? 's' : ''}`}
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1,2,3].map(i => <VehicleCardSkeleton key={i} />)}
          </div>
        ) : vehicles.length === 0 ? (
          <EmptyState
            icon="🤍"
            title="Your wishlist is empty"
            message="Heart vehicles you love and they'll appear here for quick access."
            action={<Link to="/vehicles" className="btn-primary">Browse Vehicles</Link>}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {vehicles.map(vehicle => (
              <VehicleCard key={vehicle._id} vehicle={vehicle} onWishlistChange={load} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
