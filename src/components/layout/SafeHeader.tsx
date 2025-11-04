'use client'

import React from 'react'
import { Bell, User } from 'lucide-react'
import { Button } from '@/components/ui'

interface SafeHeaderProps {
  title?: string
  showBackButton?: boolean
  onBack?: () => void
}

export function SafeHeader({ title, showBackButton, onBack }: SafeHeaderProps) {
  const displayName = 'Kullanıcı'

  return (
    <header 
      className="bg-white shadow-sm px-4 py-4 fixed top-0 left-0 right-0 z-50"
      style={{ height: '80px' }}
    >
      <div className="flex items-center justify-between h-full">
        <div className="flex items-center space-x-3">
          {showBackButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="p-2"
            >
              ←
            </Button>
          )}
          <div>
            {title ? (
              <h1 className="text-xl font-bold text-gray-900">{title}</h1>
            ) : (
              <>
                <h1 className="text-xl font-bold text-gray-900">
                  Merhaba, {displayName} 👋
                </h1>
                <p className="text-sm text-gray-500">
                  {new Date().toLocaleDateString('tr-TR', { 
                    weekday: 'long', 
                    day: 'numeric', 
                    month: 'long' 
                  })}
                </p>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" className="p-2">
            <Bell className="h-5 w-5 text-gray-600" />
          </Button>
          
          <Button 
            variant="ghost"
            size="sm"
            className="w-8 h-8 bg-primary rounded-full flex items-center justify-center p-0"
          >
            <User className="h-4 w-4 text-white" />
          </Button>
        </div>
      </div>
    </header>
  )
}