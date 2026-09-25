import React, { useState, useRef, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { User, Menu, X, Key, ChevronDown } from 'lucide-react'
import logo from '../assets/logo.png'
import { useAppContext } from '../context/AppContext'

const navItems = [
  { label: 'Home', href: '/' },
  { label: 'Services', href: '/services' },
  { label: 'Doctors', href: '/doctors' },
  { label: 'Medicore AI', href: '/ai-chat' },
  { label: 'Contact', href: '/contact' },
]

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const location = useLocation()
  const { user, token, logout } = useAppContext()

  const dropdownRef = useRef(null)
  const [portalToken, setPortalToken] = useState(localStorage.getItem('portalToken') || '')
  const [portalRole, setPortalRole] = useState(localStorage.getItem('portalRole') || '')

  useEffect(() => {
    setPortalToken(localStorage.getItem('portalToken') || '')
    setPortalRole(localStorage.getItem('portalRole') || '')
  }, [location.pathname])

  const handlePortalLogout = () => {
    localStorage.removeItem('portalToken')
    localStorage.removeItem('portalRole')
    setPortalToken('')
    setPortalRole('')
    // If they are on a dashboard route, redirect them to portal login
    if (['/admin/dashboard', '/doctor/dashboard', '/laboratory/dashboard'].includes(location.pathname)) {
      window.location.href = '/doctor-admin/login'
    } else {
      window.location.reload()
    }
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <nav className="fixed top-0 left-0 right-0 w-full z-50 bg-white/98 backdrop-blur-md border-b border-slate-200 shadow-[0_10px_30px_rgba(15,23,42,0.06)] transition-all duration-300">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="relative flex items-center justify-between h-20 gap-4">
          <Link
            to="/"
            className="flex items-center gap-3 shrink-0 group transition-transform duration-300 active:scale-95 z-10"
            onClick={() => setIsOpen(false)}
          >
            <div className="h-11 w-11 flex items-center justify-center overflow-hidden rounded-full bg-white ring-1 ring-slate-200 shadow-sm">
              <img src={logo} alt="MediCore logo" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col justify-center items-start text-left">
              <h1 className="text-xl leading-none font-black text-slate-900 tracking-tight group-hover:text-primary-600 transition-colors">
                MEDICORE
              </h1>
              <p className="text-[9px] font-bold tracking-widest text-primary-600 capitalize mt-1 leading-none">
                Excellence In Care
              </p>
            </div>
          </Link>

          <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 items-center gap-8 z-0">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href

              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`relative text-[15px] font-semibold py-1.5 transition-all duration-200 ${
                    isActive
                      ? 'text-primary-600'
                      : 'text-slate-700 hover:text-primary-600'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-500 rounded-full animate-fade-in" />
                  )}
                </Link>
              )
            })}
          </div>

          <div className="flex items-center gap-4 shrink-0 z-10">
            {portalToken ? (
              <div className="hidden lg:flex items-center gap-3">
                <Link
                  to={
                    portalRole === 'admin'
                      ? '/admin/dashboard'
                      : portalRole === 'doctor'
                      ? '/doctor/dashboard'
                      : '/laboratory/dashboard'
                  }
                  className="inline-flex items-center gap-1.5 bg-primary-500 text-white hover:bg-primary-600 px-5 py-2 rounded-full text-xs font-bold transition-all shadow-md hover:shadow-lg active:scale-95 cursor-pointer"
                >
                  <span>Go to Dashboard ({portalRole.toUpperCase()})</span>
                </Link>
                <button
                  onClick={handlePortalLogout}
                  className="inline-flex items-center gap-1.5 px-4 py-2 border border-rose-200 rounded-full text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors shadow-xs cursor-pointer"
                >
                  <span>Portal Logout</span>
                </button>
              </div>
            ) : !token ? (
              <div className="hidden lg:flex items-center gap-3">
                <Link
                  to="/doctor-admin/login"
                  className="inline-flex items-center gap-1.5 px-4 py-2 border border-primary-200 rounded-full text-xs font-bold text-slate-700 hover:bg-primary-50 transition-colors shadow-xs"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Doctor Admin</span>
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 bg-primary-500 text-white hover:bg-primary-600 px-5 py-2 rounded-full text-xs font-bold transition-all shadow-md hover:shadow-lg active:scale-95 cursor-pointer"
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>Login</span>
                </Link>
              </div>
            ) : (
              <div className="relative hidden lg:block" ref={dropdownRef}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2 focus:outline-none cursor-pointer group"
                >
                  <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 overflow-hidden shadow-xs group-hover:border-primary-500 transition-colors">
                    {user?.image ? (
                      <img src={user.image} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-4 h-4 text-slate-500" />
                    )}
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-800 transition-colors" />
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-2.5 w-48 bg-white rounded-xl shadow-xl py-2.5 border border-slate-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <Link
                      to="/my-profile"
                      onClick={() => setShowDropdown(false)}
                      className="block px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      My Profile
                    </Link>
                    <Link
                      to="/my-appointments"
                      onClick={() => setShowDropdown(false)}
                      className="block px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      My Appointments
                    </Link>
                    <div className="border-t border-slate-100 my-1.5" />
                    <button
                      onClick={() => {
                        logout()
                        setShowDropdown(false)
                      }}
                      className="block w-full text-left px-4 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}

            <button
              type="button"
              className="lg:hidden rounded-full border border-slate-200 bg-white p-2 text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
              onClick={() => setIsOpen((prev) => !prev)}
              aria-label="Toggle navigation menu"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {isOpen && (
          <div className="lg:hidden mt-2 space-y-2 rounded-2xl border border-slate-100 bg-white p-4 shadow-xl animate-in fade-in slide-in-from-top-4 duration-200">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href

              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`block px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    isActive
                      ? 'bg-primary-100 text-primary-600'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-primary-500'
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}

            {portalToken ? (
              <div className="border-t border-slate-100 mt-4 pt-4 space-y-2">
                <Link
                  to={
                    portalRole === 'admin'
                      ? '/admin/dashboard'
                      : portalRole === 'doctor'
                      ? '/doctor/dashboard'
                      : '/laboratory/dashboard'
                  }
                  onClick={() => setIsOpen(false)}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary-500 text-white text-sm font-semibold hover:bg-primary-700 transition-all shadow-md"
                >
                  <span>Go to Dashboard ({portalRole.toUpperCase()})</span>
                </Link>
                <button
                  onClick={() => {
                    handlePortalLogout()
                    setIsOpen(false)
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-rose-200 bg-white text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                >
                  <span>Portal Logout</span>
                </button>
              </div>
            ) : !token ? (
              <div className="border-t border-slate-100 mt-4 pt-4 space-y-2">
                <Link
                  to="/doctor-admin/login"
                  onClick={() => setIsOpen(false)}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span>Doctor Admin</span>
                </Link>
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary-500 text-white text-sm font-semibold hover:bg-primary-700 transition-all shadow-md"
                >
                  <Key className="w-4 h-4" />
                  <span>Login</span>
                </Link>
              </div>
            ) : (
              <div className="border-t border-slate-100 mt-4 pt-4">
                <Link
                  to="/my-profile"
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  My Profile
                </Link>
                <Link
                  to="/my-appointments"
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  My Appointments
                </Link>
                <button
                  onClick={() => {
                    logout()
                    setIsOpen(false)
                  }}
                  className="block w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
