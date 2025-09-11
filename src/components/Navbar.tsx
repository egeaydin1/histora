'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  SparklesIcon, 
  Bars3Icon, 
  XMarkIcon,
  UserCircleIcon,
  CreditCardIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  ChatBubbleLeftRightIcon,
  HomeIcon,
  UsersIcon,
  CurrencyDollarIcon,
  InformationCircleIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '@/contexts/AuthContext'

interface NavItem {
  name: string
  href: string
  icon?: React.ComponentType<any>
  requiresAuth?: boolean
}

const navigationItems: NavItem[] = [
  { 
    name: 'Ana Sayfa', 
    href: '/', 
    icon: HomeIcon 
  },
  { 
    name: 'Karakterler', 
    href: '/karakterler', 
    icon: UsersIcon 
  },
  { 
    name: 'Fiyatlandırma', 
    href: '/pricing', 
    icon: CurrencyDollarIcon 
  },
  { 
    name: 'Hakkında', 
    href: '/hakkinda', 
    icon: InformationCircleIcon 
  },
  { 
    name: 'Dashboard', 
    href: '/dashboard', 
    icon: ChartBarIcon,
    requiresAuth: true 
  }
]

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const pathname = usePathname()
  const { user, logout } = useAuth()

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false)
    setUserMenuOpen(false)
  }, [pathname])

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setUserMenuOpen(false)
    if (userMenuOpen) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [userMenuOpen])

  const handleLogout = async () => {
    try {
      await logout()
      setUserMenuOpen(false)
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const isActivePage = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(href)
  }

  const filteredNavItems = navigationItems.filter(item => 
    !item.requiresAuth || user
  )

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <SparklesIcon className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Histora</h1>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            {filteredNavItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActivePage(item.href)
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {Icon && <Icon className="h-4 w-4" />}
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </div>

          {/* User Menu & Actions */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {user ? (
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setUserMenuOpen(!userMenuOpen)
                  }}
                  className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                >
                  <UserCircleIcon className="h-5 w-5" />
                  <span>{user.display_name || user.email}</span>
                  <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                    {user.credits || 0} kredi
                  </span>
                </button>

                {/* User Dropdown Menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="py-1">
                      <div className="px-4 py-2 text-sm text-gray-500 border-b border-gray-100">
                        <div className="font-medium">{user.display_name || user.email}</div>
                        <div className="text-xs">{user.email}</div>
                        <div className="text-xs text-blue-600 mt-1">
                          Kredi: {user.credits || 0} | Token: {user.total_tokens || 0}
                        </div>
                      </div>
                      
                      <Link
                        href="/dashboard"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <ChartBarIcon className="h-4 w-4 mr-3" />
                        Dashboard
                      </Link>
                      
                      <Link
                        href="/dashboard/settings"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <Cog6ToothIcon className="h-4 w-4 mr-3" />
                        Ayarlar
                      </Link>
                      
                      <Link
                        href="/pricing"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <CreditCardIcon className="h-4 w-4 mr-3" />
                        Kredi Satın Al
                      </Link>
                      
                      <div className="border-t border-gray-100">
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          <ArrowRightOnRectangleIcon className="h-4 w-4 mr-3" />
                          Çıkış Yap
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  href="/login"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Giriş Yap
                </Link>
                <Link
                  href="/register"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Kayıt Ol
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              {isOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {filteredNavItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    isActivePage(item.href)
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {Icon && <Icon className="h-5 w-5" />}
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </div>

          {/* Mobile user section */}
          <div className="border-t border-gray-200 px-4 py-3">
            {user ? (
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <UserCircleIcon className="h-8 w-8 text-gray-400" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {user.display_name || user.email}
                    </div>
                    <div className="text-xs text-gray-500">{user.email}</div>
                    <div className="text-xs text-blue-600">
                      Kredi: {user.credits || 0} | Token: {user.total_tokens || 0}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <Link
                    href="/dashboard"
                    className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  >
                    <ChartBarIcon className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                  
                  <Link
                    href="/dashboard/settings"
                    className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  >
                    <Cog6ToothIcon className="h-4 w-4" />
                    <span>Ayarlar</span>
                  </Link>
                  
                  <Link
                    href="/pricing"
                    className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  >
                    <CreditCardIcon className="h-4 w-4" />
                    <span>Kredi Satın Al</span>
                  </Link>
                  
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 w-full px-3 py-2 rounded-md text-sm text-red-600 hover:bg-red-50"
                  >
                    <ArrowRightOnRectangleIcon className="h-4 w-4" />
                    <span>Çıkış Yap</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Link
                  href="/login"
                  className="block w-full px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 text-center"
                >
                  Giriş Yap
                </Link>
                <Link
                  href="/register"
                  className="block w-full px-3 py-2 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 text-center"
                >
                  Kayıt Ol
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}