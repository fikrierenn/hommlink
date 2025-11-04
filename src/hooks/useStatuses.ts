'use client'

import { useState, useEffect, useCallback } from 'react'
import { DatabaseService } from '@/lib/database'
import type { StatusDefinition } from '@/types'

interface UseStatusesReturn {
  statuses: StatusDefinition[]
  loading: boolean
  error: string | null
  fetchStatuses: () => Promise<void>
  getStatusById: (id: number) => StatusDefinition | undefined
  getStatusByCode: (code: string) => StatusDefinition | undefined
}

export function useStatuses(): UseStatusesReturn {
  const [statuses, setStatuses] = useState<StatusDefinition[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchStatuses = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const data = await DatabaseService.getStatusDefinitions()
      setStatuses(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch statuses'
      setError(errorMessage)
      console.error('Error fetching statuses:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const getStatusById = useCallback((id: number) => {
    return statuses.find(status => status.id === id)
  }, [statuses])

  const getStatusByCode = useCallback((code: string) => {
    return statuses.find(status => status.code === code)
  }, [statuses])

  // Auto-fetch on mount
  useEffect(() => {
    fetchStatuses()
  }, [fetchStatuses])

  return {
    statuses,
    loading,
    error,
    fetchStatuses,
    getStatusById,
    getStatusByCode
  }
}