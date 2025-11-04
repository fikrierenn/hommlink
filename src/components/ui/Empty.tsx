import React from 'react'
import { cn } from '@/lib/utils'
import { Search, Users, Plus } from 'lucide-react'
import { Button } from './Button'

interface EmptyProps {
  icon?: 'search' | 'users' | 'default'
  title?: string
  message?: string
  actionLabel?: string
  onAction?: () => void
  className?: string
}

export function Empty({ 
  icon = 'default',
  title = 'Henüz veri yok',
  message = 'Burası şu anda boş görünüyor.',
  actionLabel,
  onAction,
  className 
}: EmptyProps) {
  const icons = {
    search: Search,
    users: Users,
    default: Plus
  }
  
  const IconComponent = icons[icon]

  return (
    <div className={cn('flex flex-col items-center justify-center space-y-4 p-8', className)}>
      <div className="flex flex-col items-center space-y-3">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
          <IconComponent className="h-8 w-8 text-gray-400" />
        </div>
        <div className="text-center space-y-1">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600 max-w-sm">{message}</p>
        </div>
      </div>
      
      {actionLabel && onAction && (
        <Button onClick={onAction} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          {actionLabel}
        </Button>
      )}
    </div>
  )
}

interface EmptySearchProps {
  query?: string
  onClear?: () => void
}

export function EmptySearch({ query, onClear }: EmptySearchProps) {
  return (
    <Empty
      icon="search"
      title="Sonuç bulunamadı"
      message={query ? `"${query}" için sonuç bulunamadı.` : 'Arama kriterlerinizi değiştirmeyi deneyin.'}
      actionLabel={onClear ? "Filtreleri Temizle" : undefined}
      onAction={onClear}
    />
  )
}

interface EmptyLeadsProps {
  onAddLead?: () => void
}

export function EmptyLeads({ onAddLead }: EmptyLeadsProps) {
  return (
    <Empty
      icon="users"
      title="Henüz aday yok"
      message="İlk adayınızı ekleyerek başlayın."
      actionLabel="Aday Ekle"
      onAction={onAddLead}
    />
  )
}