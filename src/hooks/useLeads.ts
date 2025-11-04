'use client'

import { useState, useEffect, useCallback } from 'react'
import { DatabaseService } from '@/lib/database'
import type { Lead, LeadFilters, PaginatedResponse, LeadInsert, LeadUpdate } from '@/types'

interface UseLeadsOptions {
  filters?: LeadFilters
  autoFetch?: boolean
  pageSize?: number
}

interface UseLeadsReturn {
  leads: Lead[]
  loading: boolean
  error: string | null
  pagination: {
    page: number
    hasMore: boolean
    total: number
  }
  // Actions
  fetchLeads: () => Promise<void>
  loadMore: () => Promise<void>
  refresh: () => Promise<void>
  createLead: (leadData: LeadInsert) => Promise<Lead>
  updateLead: (id: string, updates: LeadUpdate) => Promise<Lead>
  deleteLead: (id: string) => Promise<void>
  // Filters
  setFilters: (filters: LeadFilters) => void
}

export function useLeads(options: UseLeadsOptions = {}): UseLeadsReturn {
  const { filters: initialFilters, autoFetch = true, pageSize = 20 } = options

  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<LeadFilters>(initialFilters || {})
  const [pagination, setPagination] = useState({
    page: 1,
    hasMore: false,
    total: 0
  })

  const fetchLeads = useCallback(async (page = 1, append = false) => {
    try {
      setLoading(true)
      setError(null)

      const result = await DatabaseService.getLeads(filters, page, pageSize)

      if (append) {
        setLeads(prev => [...prev, ...result.data])
      } else {
        setLeads(result.data)
      }

      setPagination({
        page: result.page,
        hasMore: result.hasMore,
        total: result.count
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch leads'
      setError(errorMessage)
      console.error('Error fetching leads:', err)
    } finally {
      setLoading(false)
    }
  }, [filters, pageSize])

  const loadMore = useCallback(async () => {
    if (!pagination.hasMore || loading) return
    await fetchLeads(pagination.page + 1, true)
  }, [fetchLeads, pagination.hasMore, pagination.page, loading])

  const refresh = useCallback(async () => {
    await fetchLeads(1, false)
  }, [fetchLeads])

  const createLead = useCallback(async (leadData: LeadInsert): Promise<Lead> => {
    try {
      setError(null)
      const newLead = await DatabaseService.createLead(leadData)
      
      // Add to the beginning of the list
      setLeads(prev => [newLead, ...prev])
      setPagination(prev => ({ ...prev, total: prev.total + 1 }))
      
      return newLead
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create lead'
      setError(errorMessage)
      throw err
    }
  }, [])

  const updateLead = useCallback(async (id: string, updates: LeadUpdate): Promise<Lead> => {
    try {
      setError(null)
      const updatedLead = await DatabaseService.updateLead(id, updates)
      
      // Update in the list
      setLeads(prev => prev.map(lead => 
        lead.id === id ? updatedLead : lead
      ))
      
      return updatedLead
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update lead'
      setError(errorMessage)
      throw err
    }
  }, [])

  const deleteLead = useCallback(async (id: string): Promise<void> => {
    try {
      setError(null)
      await DatabaseService.deleteLead(id)
      
      // Remove from the list
      setLeads(prev => prev.filter(lead => lead.id !== id))
      setPagination(prev => ({ ...prev, total: prev.total - 1 }))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete lead'
      setError(errorMessage)
      throw err
    }
  }, [])

  const handleSetFilters = useCallback((newFilters: LeadFilters) => {
    setFilters(newFilters)
    setPagination(prev => ({ ...prev, page: 1 }))
  }, [])

  // Auto-fetch on mount and filter changes
  useEffect(() => {
    if (autoFetch) {
      fetchLeads(1, false)
    }
  }, [filters, autoFetch, pageSize]) // Add pageSize to dependencies

  return {
    leads,
    loading,
    error,
    pagination,
    fetchLeads: () => fetchLeads(1, false),
    loadMore,
    refresh,
    createLead,
    updateLead,
    deleteLead,
    setFilters: handleSetFilters
  }
}