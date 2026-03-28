/**
 * NAVBAR
 * Sticky top navigation with mobile hamburger menu
 */

import React, { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, isLoggedIn, isAdmin, logout } = useAuth()
  const navigate = useNavigate()
  const [scrolled, setScrolled]   = useState(false)
  const [mobileOpen, setMobile]   = useState(false)
  const [profileOpen, setProfile] = useState(false)

  // Add glass effect when scrolled
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleLogout = () => {
    logout()
    setProfile(false)
    navigate('/')
  }

  const navLinks = [
    { to: '/vehicles', label: 'Browse Vehicles' },
    ...(isLoggedIn ? [
      { to: '/dashboard', label: 'My Bookings' },
      { to: '/wishlist',  label: 'Wishlist' },
    ] : []),
    ...(isAdmin ? [{ to: '/admin', label: '⚡ Admin' }] : []),
  ]

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-dark-900/95 backdrop-blur-xl border-b border-white/[0.06] shadow-2xl' : 'bg-transparent'
    }`}>
      <div className="container-app">
        <div className="flex items-center justify-between h-16">

          {/* ── Logo ── */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center
                            group-hover:bg-primary-400 transition-colors shadow-lg shadow-primary-500/30">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white">
                <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
              </svg>
            </div>
            <span className="text-xl font-display font-bold text-white">
              Drive<span className="text-primary-500">X</span>
            </span>
          </Link>

          {/* ── Desktop Nav Links ── */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-primary-500/15 text-primary-400'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          {/* ── Auth Buttons / User Menu ── */}
          <div className="hidden md:flex items-center gap-3">
            {isLoggedIn ? (
              <div className="relative">
                <button
                  onClick={() => setProfile(!profileOpen)}
                  className="flex items-center gap-2.5 bg-white/5 hover:bg-white/10
                             border border-white/10 rounded-xl px-3 py-2
                             transition-all duration-200"
                >
                  <div className="w-7 h-7 rounded-lg bg-primary-500/20 flex items-center justify-center">
                    <span className="text-primary-400 text-xs font-bold">
                      {user?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-white">{user?.name?.split(' ')[0]}</span>
                  <svg className={`w-4 h-4 text-gray-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown */}
                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-dark-800 border border-white/10
                                  rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
                    <div className="p-3 border-b border-white/5">
                      <p className="text-sm font-semibold text-white">{user?.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>
                    <div className="p-1.5">
                      <Link to="/dashboard" onClick={() => setProfile(false)}
                        className="flex items-center gap-2.5 w-full px-3 py-2 text-sm
                                   text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                        📋 My Bookings
                      </Link>
                      <Link to="/wishlist" onClick={() => setProfile(false)}
                        className="flex items-center gap-2.5 w-full px-3 py-2 text-sm
                                   text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                        ❤️ Wishlist
                      </Link>
                      {isAdmin && (
                        <Link to="/admin" onClick={() => setProfile(false)}
                          className="flex items-center gap-2.5 w-full px-3 py-2 text-sm
                                     text-primary-400 hover:bg-primary-500/10 rounded-lg transition-colors">
                          ⚡ Admin Panel
                        </Link>
                      )}
                      <div className="h-px bg-white/5 my-1" />
                      <button onClick={handleLogout}
                        className="flex items-center gap-2.5 w-full px-3 py-2 text-sm
                                   text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                        🚪 Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="btn-ghost text-sm">Login</Link>
                <Link to="/register" className="btn-primary text-sm">Get Started</Link>
              </>
            )}
          </div>

          {/* ── Mobile Hamburger ── */}
          <button
            onClick={() => setMobile(!mobileOpen)}
            className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
            aria-label="Menu"
          >
            {mobileOpen ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* ── Mobile Menu ── */}
        {mobileOpen && (
          <div className="md:hidden bg-dark-800 border-t border-white/5 rounded-b-2xl
                          pb-4 animate-fade-in">
            <div className="px-4 py-2 space-y-1 mt-2">
              {navLinks.map(link => (
                <NavLink key={link.to} to={link.to}
                  onClick={() => setMobile(false)}
                  className={({ isActive }) =>
                    `block px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      isActive ? 'bg-primary-500/15 text-primary-400' : 'text-gray-300 hover:bg-white/5'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
              <div className="h-px bg-white/5 my-2" />
              {isLoggedIn ? (
                <button onClick={handleLogout}
                  className="block w-full text-left px-4 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-500/10">
                  🚪 Logout
                </button>
              ) : (
                <div className="flex gap-2 pt-1">
                  <Link to="/login" onClick={() => setMobile(false)} className="btn-secondary flex-1 text-sm">Login</Link>
                  <Link to="/register" onClick={() => setMobile(false)} className="btn-primary flex-1 text-sm">Sign Up</Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
