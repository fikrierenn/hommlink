'use client'

import React from 'react'

interface SimpleHeaderProps {
  title?: string
}

export function SimpleHeader({ title }: SimpleHeaderProps) {
  return (
    <header 
      className="bg-white shadow-sm px-4 py-4 fixed top-0 left-0 right-0 z-50"
      style={{ height: '80px' }}
    >
      <div className="flex items-center justify-between h-full">
        <h1 className="text-xl font-bold text-gray-900">
          {title || 'HommLink CRM'}
        </h1>
        <div className="text-sm text-gray-600">
          Kullanıcı
        </div>
      </div>
    </header>
  )
}