import React from 'react'
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-dark-800 border-t border-white/[0.06] mt-auto">
      <div className="container-app py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-bold">D</span>
              </div>
              <span className="text-xl font-display font-bold">Drive<span className="text-primary-500">X</span></span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
              India's premium vehicle rental platform. From city rides to mountain adventures — we've got your perfect vehicle.
            </p>
            <p className="text-gray-600 text-xs mt-4">© 2024 DriveX. Built for the portfolio.</p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Explore</h4>
            <ul className="space-y-2">
              {[['/', 'Home'], ['/vehicles', 'Browse Vehicles'], ['/vehicles?type=car', 'Cars'], ['/vehicles?type=bike', 'Bikes']].map(([to, label]) => (
                <li key={to}><Link to={to} className="text-sm text-gray-500 hover:text-primary-400 transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Account</h4>
            <ul className="space-y-2">
              {[['/login', 'Login'], ['/register', 'Sign Up'], ['/dashboard', 'My Bookings'], ['/wishlist', 'Wishlist']].map(([to, label]) => (
                <li key={to}><Link to={to} className="text-sm text-gray-500 hover:text-primary-400 transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/[0.04]">
        <div className="container-app py-4">
          <p className="text-center text-xs text-gray-600">
            Made with ❤️ · React + Node.js + MongoDB · 
            <span className="text-primary-600"> Interview-ready project</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
