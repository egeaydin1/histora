'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Sidebar } from '@/components/admin/Sidebar'
import { Header } from '@/components/admin/Header'

interface AdminUser {
  id: string
  email: string
  full_name: string
  role: string
  is_admin: boolean
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<AdminUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Skip auth check for login page
    if (pathname === '/admin/login') {
      setIsLoading(false)
      return
    }

    // Check authentication
    const token = localStorage.getItem('histora_admin_token')
    const userData = localStorage.getItem('histora_admin_user')

    if (!token || !userData) {
      router.push('/admin/login')
      return
    }

    try {
      const user = JSON.parse(userData) as AdminUser
      
      if (!user.is_admin) {
        localStorage.removeItem('histora_admin_token')
        localStorage.removeItem('histora_admin_user')
        router.push('/admin/login')
        return
      }

      setUser(user)
    } catch (error) {
      console.error('Invalid user data:', error)
      localStorage.removeItem('histora_admin_token')
      localStorage.removeItem('histora_admin_user')
      router.push('/admin/login')
      return
    }

    setIsLoading(false)
  }, [pathname, router])

  // Show loading screen
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    )
  }

  // Show login page
  if (pathname === '/admin/login') {
    return children
  }

  // Show admin panel
  if (!user) {
    return null // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
