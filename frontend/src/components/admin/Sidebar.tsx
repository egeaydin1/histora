'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Users, 
  Upload, 
  Settings, 
  Home, 
  Database,
  BarChart3,
  FileText,
  CreditCard,
  UserCheck
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: Home },
  { name: 'Users', href: '/admin/users', icon: UserCheck },
  { name: 'Characters', href: '/admin/characters', icon: Users },
  { name: 'Plans & Pricing', href: '/admin/plans', icon: CreditCard },
  { name: 'Sources', href: '/admin/sources', icon: FileText },
  { name: 'Upload', href: '/admin/upload', icon: Upload },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { name: 'Database', href: '/admin/database', icon: Database },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="hidden md:flex md:w-64 md:flex-col">
      <div className="flex flex-col flex-grow pt-5 overflow-y-auto bg-white border-r border-gray-200">
        <div className="flex items-center flex-shrink-0 px-4">
          <h1 className="text-xl font-bold text-gray-900">Histora Admin</h1>
        </div>
        <div className="mt-8 flex-grow flex flex-col">
          <nav className="flex-1 px-2 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`${
                    isActive
                      ? 'bg-blue-50 border-r-2 border-blue-500 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  } group flex items-center px-2 py-2 text-sm font-medium`}
                >
                  <item.icon
                    className={`${
                      isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                    } mr-3 flex-shrink-0 h-5 w-5`}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
        <div className="flex-shrink-0 p-4 border-t border-gray-200">
          <div className="text-xs text-gray-500">
            Histora Admin Panel v1.0.0
          </div>
        </div>
      </div>
    </div>
  )
}
