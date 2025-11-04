'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Users, Plus, BarChart3, User } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavItem {
  href: string
  icon: React.ComponentType<{ className?: string }>
  label: string
  isAction?: boolean
}

const navItems: NavItem[] = [
  {
    href: '/dashboard',
    icon: Home,
    label: 'Ana Sayfa'
  },
  {
    href: '/leads',
    icon: Users,
    label: 'Adaylar'
  },
  {
    href: '/leads/new',
    icon: Plus,
    label: '',
    isAction: true
  },
  {
    href: '/reports',
    icon: BarChart3,
    label: 'Raporlar'
  },
  {
    href: '/profile',
    icon: User,
    label: 'Profil'
  }
]

export function BottomNavigation() {
  const pathname = usePathname()

  return (
    <nav 
      className="bg-white border-t border-gray-200 px-4 py-2 fixed bottom-0 left-0 right-0 z-50"
      style={{ height: '80px' }}
    >
      <div className="flex items-center justify-around h-full">
        {navItems.map((item) => {
          const isActive = pathname === item.href || 
                          (item.href === '/dashboard' && pathname === '/')
          const Icon = item.icon

          if (item.isAction) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center py-2 px-3"
              >
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-1">
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </Link>
            )
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center py-2 px-3"
            >
              <Icon 
                className={cn(
                  'h-6 w-6 mb-1',
                  isActive ? 'text-primary' : 'text-gray-400'
                )} 
              />
              <span 
                className={cn(
                  'text-xs mt-1',
                  isActive ? 'text-primary font-medium' : 'text-gray-400'
                )}
              >
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}