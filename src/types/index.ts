// Re-export all types for easy importing
export * from './database'
export * from './api'
export * from './forms'
export * from './validation'

// Common utility types
export interface SelectOption {
  value: string | number
  label: string
  disabled?: boolean
}

export interface PaginationInfo {
  page: number
  limit: number
  total: number
  hasMore: boolean
}

export interface SortInfo {
  field: string
  direction: 'asc' | 'desc'
}

// UI state types
export interface LoadingState {
  isLoading: boolean
  error?: string
}

export interface AsyncState<T> extends LoadingState {
  data?: T
}

// Navigation types
export interface NavItem {
  href: string
  label: string
  icon?: React.ComponentType<{ className?: string }>
  isActive?: boolean
  badge?: string | number
}

// Notification types
export interface NotificationData {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  timestamp: string
  read: boolean
  action?: {
    label: string
    href: string
  }
}