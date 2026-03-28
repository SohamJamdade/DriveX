/**
 * VEHICLES PAGE
 * Full listing with search, filters, pagination
 */

import React, { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { vehicleAPI } from '../services/api'
import VehicleCard from '../components/VehicleCard'
import { VehicleCardSkeleton, EmptyState } from '../components/ui/LoadingScreen'

export default function Vehicles() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [vehicles, setVehicles]     = useState([])
  const [loading, setLoading]       = useState(true)
  const [total, setTotal]           = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [cities, setCities]         = useState([])
  const [sidebarOpen, setSidebar]   = useState(false)

  // Filters state (read from URL params for shareability)
  const [filters, setFilters] = useState({
    search:      searchParams.get('search')      || '',
    type:        searchParams.get('type')        || '',
    fuelType:    searchParams.get('fuelType')    || '',
    city:        searchParams.get('city')        || '',
    transmission:searchParams.get('transmission')|| '',
    minPrice:    searchParams.get('minPrice')    || '',
    maxPrice:    searchParams.get('maxPrice')    || '',
    sort:        searchParams.get('sort')        || '-bookingCount',
    page:        parseInt(searchParams.get('page') || '1'),
  })

  // Load available cities
  useEffect(() => {
    vehicleAPI.getCities().then(r => setCities(r.data.cities)).catch(() => {})
  }, [])

  // Fetch vehicles when filters change
  const fetchVehicles = useCallback(async () => {
    setLoading(true)
    try {
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([, v]) => v !== '' && v !== null)
      )
      const res = await vehicleAPI.getAll(cleanFilters)
      setVehicles(res.data.vehicles)
      setTotal(res.data.total)
      setTotalPages(res.data.totalPages)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => { fetchVehicles() }, [fetchVehicles])

  // Sync filters → URL params
  useEffect(() => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([k, v]) => {
      if (v && v !== '' && !(k === 'page' && v === 1)) params.set(k, v)
    })
    setSearchParams(params, { replace: true })
  }, [filters])

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 })) // reset page on filter change
  }

  const clearFilters = () => {
    setFilters({ search: '', type: '', fuelType: '', city: '',
                 transmission: '', minPrice: '', maxPrice: '',
                 sort: '-bookingCount', page: 1 })
  }

  const activeFilterCount = [
    filters.type, filters.fuelType, filters.city,
    filters.transmission, filters.minPrice, filters.maxPrice
  ].filter(Boolean).length

  // ─── Sidebar Filters ─────────────────────────
  const FilterSidebar = () => (
    <div className="space-y-6">
      {/* Clear */}
      {activeFilterCount > 0 && (
        <button onClick={clearFilters}
          className="w-full text-center text-xs text-primary-400 hover:text-primary-300
                     py-2 border border-primary-500/20 rounded-lg transition-colors">
          ✕ Clear {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''}
        </button>
      )}

      {/* Vehicle Type */}
      <div>
        <label className="label">Vehicle Type</label>
        <div className="space-y-1.5">
          {[['', 'All Types'], ['car', '🚗 Car'], ['suv', '🚙 SUV'],
            ['bike', '🏍️ Bike'], ['scooter', '🛵 Scooter'], ['van', '🚐 Van']].map(([val, label]) => (
            <label key={val} className="flex items-center gap-2.5 cursor-pointer group">
              <input type="radio" name="type" value={val}
                checked={filters.type === val}
                onChange={() => updateFilter('type', val)}
                className="accent-orange-500 w-4 h-4" />
              <span className={`text-sm transition-colors ${filters.type === val ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'}`}>
                {label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Fuel Type */}
      <div>
        <label className="label">Fuel Type</label>
        <div className="space-y-1.5">
          {[['', 'All Fuel'], ['petrol', '⛽ Petrol'], ['diesel', '🛢️ Diesel'],
            ['electric', '⚡ Electric'], ['hybrid', '🌿 Hybrid']].map(([val, label]) => (
            <label key={val} className="flex items-center gap-2.5 cursor-pointer group">
              <input type="radio" name="fuel" value={val}
                checked={filters.fuelType === val}
                onChange={() => updateFilter('fuelType', val)}
                className="accent-orange-500 w-4 h-4" />
              <span className={`text-sm transition-colors ${filters.fuelType === val ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'}`}>
                {label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* City */}
      <div>
        <label className="label">City</label>
        <select value={filters.city} onChange={e => updateFilter('city', e.target.value)}
          className="input text-sm">
          <option value="">All Cities</option>
          {cities.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Transmission */}
      <div>
        <label className="label">Transmission</label>
        <div className="flex gap-2">
          {[['', 'All'], ['manual', 'Manual'], ['automatic', 'Auto']].map(([val, label]) => (
            <button key={val}
              onClick={() => updateFilter('transmission', val)}
              className={`flex-1 py-2 text-xs rounded-lg border transition-all ${
                filters.transmission === val
                  ? 'bg-primary-500/20 border-primary-500/50 text-primary-400'
                  : 'border-white/10 text-gray-400 hover:border-white/20'
              }`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <label className="label">Price Range (₹/day)</label>
        <div className="flex gap-2">
          <input type="number" placeholder="Min" value={filters.minPrice}
            onChange={e => updateFilter('minPrice', e.target.value)}
            className="input text-sm" />
          <input type="number" placeholder="Max" value={filters.maxPrice}
            onChange={e => updateFilter('maxPrice', e.target.value)}
            className="input text-sm" />
        </div>
        <div className="flex gap-2 mt-2 flex-wrap">
          {[[500, 1000], [1000, 2500], [2500, 5000]].map(([min, max]) => (
            <button key={min}
              onClick={() => setFilters(p => ({ ...p, minPrice: min, maxPrice: max, page: 1 }))}
              className="text-xs px-2 py-1 rounded-lg border border-white/10
                         text-gray-400 hover:border-primary-500/30 hover:text-primary-400 transition-all">
              ₹{min}–{max}
            </button>
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen pt-20">
      <div className="container-app py-8">

        {/* ── Page Header ── */}
        <div className="mb-6">
          <h1 className="text-3xl font-display font-bold text-white">Browse Vehicles</h1>
          <p className="text-gray-400 text-sm mt-1">
            {loading ? 'Searching...' : `${total} vehicle${total !== 1 ? 's' : ''} found`}
          </p>
        </div>

        {/* ── Search + Sort bar ── */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500">🔍</span>
            <input
              type="text"
              placeholder="Search by name, brand..."
              value={filters.search}
              onChange={e => updateFilter('search', e.target.value)}
              className="input pl-10"
            />
          </div>

          <select value={filters.sort} onChange={e => updateFilter('sort', e.target.value)}
            className="input sm:w-52">
            <option value="-bookingCount">🔥 Most Popular</option>
            <option value="pricePerDay">💰 Price: Low → High</option>
            <option value="-pricePerDay">💎 Price: High → Low</option>
            <option value="-rating">⭐ Highest Rated</option>
            <option value="-createdAt">🆕 Newest First</option>
          </select>

          {/* Mobile filter toggle */}
          <button onClick={() => setSidebar(!sidebarOpen)}
            className="sm:hidden btn-secondary relative">
            🎛️ Filters
            {activeFilterCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-primary-500 text-white
                               text-xs rounded-full flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        <div className="flex gap-6">
          {/* ── Desktop Sidebar ── */}
          <aside className="hidden sm:block w-64 flex-shrink-0">
            <div className="card p-5 sticky top-24">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                🎛️ Filters
                {activeFilterCount > 0 && (
                  <span className="badge-orange text-xs">{activeFilterCount}</span>
                )}
              </h3>
              <FilterSidebar />
            </div>
          </aside>

          {/* ── Mobile Sidebar Overlay ── */}
          {sidebarOpen && (
            <div className="sm:hidden fixed inset-0 z-50 flex">
              <div className="absolute inset-0 bg-black/50" onClick={() => setSidebar(false)} />
              <div className="relative ml-auto w-72 h-full bg-dark-800 border-l border-white/10
                              p-5 overflow-y-auto">
                <div className="flex justify-between items-center mb-5">
                  <h3 className="font-semibold text-white">Filters</h3>
                  <button onClick={() => setSidebar(false)} className="text-gray-400">✕</button>
                </div>
                <FilterSidebar />
              </div>
            </div>
          )}

          {/* ── Main Grid ── */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {Array(9).fill(0).map((_, i) => <VehicleCardSkeleton key={i} />)}
              </div>
            ) : vehicles.length === 0 ? (
              <EmptyState
                icon="🚗"
                title="No vehicles found"
                message="Try adjusting your filters or search in a different city."
                action={
                  <button onClick={clearFilters} className="btn-primary">
                    Clear All Filters
                  </button>
                }
              />
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {vehicles.map((v, i) => (
                    <div key={v._id} style={{ animationDelay: `${i * 50}ms` }}>
                      <VehicleCard vehicle={v} onWishlistChange={fetchVehicles} />
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-10">
                    <button
                      onClick={() => updateFilter('page', filters.page - 1)}
                      disabled={filters.page <= 1}
                      className="btn-secondary px-4 py-2 text-sm disabled:opacity-40">
                      ← Prev
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(p => Math.abs(p - filters.page) <= 2)
                      .map(p => (
                        <button key={p}
                          onClick={() => updateFilter('page', p)}
                          className={`w-10 h-10 rounded-xl text-sm font-medium transition-all ${
                            p === filters.page
                              ? 'bg-primary-500 text-white'
                              : 'bg-dark-700 text-gray-400 hover:bg-dark-600'
                          }`}>
                          {p}
                        </button>
                    ))}
                    <button
                      onClick={() => updateFilter('page', filters.page + 1)}
                      disabled={filters.page >= totalPages}
                      className="btn-secondary px-4 py-2 text-sm disabled:opacity-40">
                      Next →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
