/**
 * HOME PAGE
 * Hero section + search bar + featured cities + recommended vehicles
 */

import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { vehicleAPI } from '../services/api'
import VehicleCard from '../components/VehicleCard'
import { VehicleCardSkeleton, SectionHeader } from '../components/ui/LoadingScreen'

// ─── Hero Search Bar ──────────────────────────
function HeroSearch() {
  const navigate = useNavigate()
  const [search, setSearch]   = useState('')
  const [city, setCity]       = useState('')
  const [type, setType]       = useState('')
  const [cities, setCities]   = useState([])

  useEffect(() => {
    vehicleAPI.getCities().then(r => setCities(r.data.cities)).catch(() => {})
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (city)   params.set('city', city)
    if (type)   params.set('type', type)
    navigate(`/vehicles?${params.toString()}`)
  }

  return (
    <form onSubmit={handleSearch}
      className="glass rounded-2xl p-4 md:p-5 flex flex-col md:flex-row gap-3
                 shadow-2xl shadow-black/50 w-full max-w-3xl mx-auto">

      {/* Search input */}
      <div className="flex-1 relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500">🔍</span>
        <input
          type="text"
          placeholder="Search vehicles, brands..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input pl-10 h-12 text-sm"
        />
      </div>

      {/* City */}
      <select value={city} onChange={e => setCity(e.target.value)}
        className="input h-12 text-sm md:w-40">
        <option value="">All Cities</option>
        {cities.map(c => <option key={c} value={c}>{c}</option>)}
      </select>

      {/* Type */}
      <select value={type} onChange={e => setType(e.target.value)}
        className="input h-12 text-sm md:w-36">
        <option value="">All Types</option>
        <option value="car">🚗 Car</option>
        <option value="suv">🚙 SUV</option>
        <option value="bike">🏍️ Bike</option>
        <option value="scooter">🛵 Scooter</option>
        <option value="van">🚐 Van</option>
      </select>

      <button type="submit" className="btn-primary h-12 px-6 whitespace-nowrap">
        Find Vehicles →
      </button>
    </form>
  )
}

// ─── Stats Banner ─────────────────────────────
function StatsBanner() {
  const stats = [
    { icon: '🚗', value: '500+', label: 'Vehicles' },
    { icon: '🏙️', value: '15+', label: 'Cities' },
    { icon: '⭐', value: '4.8', label: 'Avg Rating' },
    { icon: '😊', value: '10K+', label: 'Happy Renters' },
  ]
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16">
      {stats.map(({ icon, value, label }) => (
        <div key={label} className="glass rounded-2xl p-5 text-center">
          <div className="text-3xl mb-1">{icon}</div>
          <div className="text-2xl font-display font-bold text-white">{value}</div>
          <div className="text-xs text-gray-500 mt-0.5">{label}</div>
        </div>
      ))}
    </div>
  )
}

// ─── Vehicle Category Cards ───────────────────
function CategoryCards() {
  const navigate = useNavigate()
  const categories = [
    { type: 'car',     icon: '🚗', label: 'Cars',     desc: 'Sedans & hatchbacks', color: 'from-blue-500/20 to-blue-600/5' },
    { type: 'suv',     icon: '🚙', label: 'SUVs',     desc: 'Power & comfort', color: 'from-green-500/20 to-green-600/5' },
    { type: 'bike',    icon: '🏍️', label: 'Bikes',    desc: 'Thrill & freedom', color: 'from-red-500/20 to-red-600/5' },
    { type: 'scooter', icon: '🛵', label: 'Scooters', desc: 'City convenience', color: 'from-yellow-500/20 to-yellow-600/5' },
    { type: 'van',     icon: '🚐', label: 'Vans',     desc: 'Group travel', color: 'from-purple-500/20 to-purple-600/5' },
    { type: 'electric',icon: '⚡', label: 'Electric', desc: 'Eco friendly', color: 'from-primary-500/20 to-primary-600/5' },
  ]
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {categories.map(({ type, icon, label, desc, color }) => (
        <button key={type}
          onClick={() => navigate(`/vehicles?${type === 'electric' ? 'fuelType=electric' : `type=${type}`}`)}
          className={`card hover:border-primary-500/30 p-5 text-center group
                      hover:-translate-y-1 transition-all duration-300
                      bg-gradient-to-br ${color} border-white/[0.06]`}>
          <div className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-300">{icon}</div>
          <div className="text-sm font-semibold text-white">{label}</div>
          <div className="text-xs text-gray-500 mt-0.5">{desc}</div>
        </button>
      ))}
    </div>
  )
}

// ─── Why DriveX ───────────────────────────────
function WhyUs() {
  const features = [
    { icon: '🔒', title: 'Verified Vehicles', desc: 'Every vehicle is inspected and certified before listing.' },
    { icon: '📱', title: 'Instant Booking',   desc: 'Book in under 2 minutes. No paperwork, no waiting.' },
    { icon: '💰', title: 'Best Price Guarantee', desc: 'We match any lower price or refund the difference.' },
    { icon: '🛡️', title: '24/7 Support',     desc: 'Our team is always on standby for any emergency.' },
  ]
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {features.map(({ icon, title, desc }) => (
        <div key={title} className="card p-6 hover:border-primary-500/20 transition-all duration-300">
          <div className="text-3xl mb-3">{icon}</div>
          <h4 className="font-display font-semibold text-white mb-1.5">{title}</h4>
          <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
        </div>
      ))}
    </div>
  )
}

// ─── Main Home Component ──────────────────────
export default function Home() {
  const [recommended, setRecommended] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    vehicleAPI.getRecommended()
      .then(r => setRecommended(r.data.vehicles))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen">

      {/* ── HERO ───────────────────────────── */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 hero-pattern opacity-50" />
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-primary-600/5 rounded-full blur-2xl pointer-events-none" />

        <div className="container-app relative">
          <div className="text-center max-w-4xl mx-auto">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 bg-primary-500/10 border border-primary-500/20
                            px-4 py-1.5 rounded-full mb-6 animate-in">
              <span className="w-2 h-2 bg-primary-500 rounded-full animate-pulse-slow" />
              <span className="text-sm text-primary-400 font-medium">500+ vehicles across India</span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl md:text-7xl font-display font-extrabold text-white leading-[1.05] mb-6 animate-in delay-100">
              Drive Your
              <span className="block text-transparent bg-clip-text
                               bg-gradient-to-r from-primary-400 to-primary-600">
                Way Forward
              </span>
            </h1>

            <p className="text-lg text-gray-400 max-w-xl mx-auto mb-10 leading-relaxed animate-in delay-200">
              Premium vehicle rentals without the hassle. Cars, bikes, SUVs — 
              delivered to your door across 15 cities.
            </p>

            {/* Search Bar */}
            <div className="animate-in delay-300">
              <HeroSearch />
            </div>

            {/* Quick links */}
            <div className="flex flex-wrap justify-center gap-2 mt-6 text-xs text-gray-500 animate-in delay-400">
              <span>Popular:</span>
              {['Mumbai', 'Delhi', 'Bangalore', 'Goa', 'Manali'].map(city => (
                <button key={city} onClick={() => navigate(`/vehicles?city=${city}`)}
                  className="text-primary-400 hover:text-primary-300 transition-colors underline underline-offset-2">
                  {city}
                </button>
              ))}
            </div>
          </div>

          {/* Stats */}
          <StatsBanner />
        </div>
      </section>

      {/* Divider */}
      <div className="glow-divider" />

      {/* ── CATEGORIES ─────────────────────── */}
      <section className="section">
        <div className="container-app">
          <SectionHeader
            label="Browse by Type"
            title="Find Your Perfect Ride"
            subtitle="From daily commutes to weekend adventures — we have the right vehicle for every journey."
          />
          <CategoryCards />
        </div>
      </section>

      {/* ── RECOMMENDED ────────────────────── */}
      <section className="section pt-0">
        <div className="container-app">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-primary-500
                               bg-primary-500/10 px-3 py-1 rounded-full">
                🤖 AI Picks
              </span>
              <h2 className="text-2xl font-display font-bold text-white mt-2">Trending Now</h2>
            </div>
            <button onClick={() => navigate('/vehicles')}
              className="btn-ghost text-sm hidden md:flex">
              View all →
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1,2,3].map(i => <VehicleCardSkeleton key={i} />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {recommended.map((vehicle, i) => (
                <div key={vehicle._id} style={{ animationDelay: `${i * 80}ms` }}>
                  <VehicleCard vehicle={vehicle} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── WHY US ─────────────────────────── */}
      <section className="section pt-0">
        <div className="container-app">
          <SectionHeader
            label="Why DriveX"
            title="The Smarter Way to Rent"
          />
          <WhyUs />
        </div>
      </section>

      {/* ── CTA BANNER ─────────────────────── */}
      <section className="section pt-0">
        <div className="container-app">
          <div className="relative overflow-hidden rounded-3xl
                          bg-gradient-to-br from-primary-600 to-primary-800
                          p-10 md:p-16 text-center">
            <div className="absolute inset-0 opacity-10 hero-pattern" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
            <div className="relative">
              <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-4">
                Ready to Hit the Road?
              </h2>
              <p className="text-primary-100 mb-8 max-w-md mx-auto">
                Join 10,000+ happy renters. No hidden fees, no surprises.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button onClick={() => navigate('/vehicles')}
                  className="bg-white text-primary-700 font-semibold px-8 py-3 rounded-xl
                             hover:bg-primary-50 transition-colors shadow-lg">
                  Browse Vehicles →
                </button>
                <button onClick={() => navigate('/register')}
                  className="bg-white/10 text-white font-semibold px-8 py-3 rounded-xl
                             border border-white/20 hover:bg-white/20 transition-colors">
                  Create Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
