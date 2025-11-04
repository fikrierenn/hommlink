'use client'

import { useState, useEffect, useCallback } from 'react'
import { DatabaseService } from '@/lib/database'
import type { Lead, LeadEvent, LeadUpdate, LeadEventInsert } from '@/types'

interface UseLeadDetailReturn {
  lead: Lead | null
  events: LeadEvent[]
  loading: boolean
  error: string | null
  // Actions
  fetchLead: () => Promise<void>
  updateLead: (updates: LeadUpdate) => Promise<Lead>
  addEvent: (eventData: LeadEventInsert) => Promise<LeadEvent>
  refresh: () => Promise<void>
}

export function useLeadDetail(leadId: string): UseLeadDetailReturn {
  const [lead, setLead] = useState<Lead | null>(null)
  const [events, setEvents] = useState<LeadEvent[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchLead = useCallback(async () => {
    if (!leadId) return

    try {
      setLoading(true)
      setError(null)

      const [leadData, eventsData] = await Promise.all([
        DatabaseService.getLeadById(leadId),
        DatabaseService.getLeadEvents(leadId)
      ])

      if (!leadData) {
        setError('Lead not found')
        return
      }

      setLead(leadData)
      setEvents(eventsData)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch lead details'
      setError(errorMessage)
      console.error('Error fetching lead details:', err)
    } finally {
      setLoading(false)
    }
  }, [leadId])

  const updateLead = useCallback(async (updates: LeadUpdate): Promise<Lead> => {
    if (!leadId) throw new Error('No lead ID provided')

    try {
      setError(null)
      const updatedLead = await DatabaseService.updateLead(leadId, updates)
      setLead(updatedLead)
      return updatedLead
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update lead'
      setError(errorMessage)
      throw err
    }
  }, [leadId])

  const addEvent = useCallback(async (eventData: LeadEventInsert): Promise<LeadEvent> => {
    try {
      setError(null)
      const newEvent = await DatabaseService.createLeadEvent({
        ...eventData,
        lead_id: leadId
      })
      
      // Add to the beginning of events list
      setEvents(prev => [newEvent, ...prev])
      
      return newEvent
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add event'
      setError(errorMessage)
      throw err
    }
  }, [leadId])

  const refresh = useCallback(async () => {
    await fetchLead()
  }, [fetchLead])

  // Auto-fetch on mount and leadId change
  useEffect(() => {
    if (leadId) {
      fetchLead()
    }
  }, [fetchLead, leadId])

  // Set up real-time subscription for events
  useEffect(() => {
    if (!leadId) return

    const subscription = DatabaseService.subscribeToLeadEvents(leadId, (payload) => {
      console.log('Lead event change:', payload)
      
      if (payload.eventType === 'INSERT') {
        setEvents(prev => [payload.new, ...prev])
      } else if (payload.eventType === 'UPDATE') {
        setEvents(prev => prev.map(event => 
          event.id === payload.new.id ? payload.new : event
        ))
      } else if (payload.eventType === 'DELETE') {
        setEvents(prev => prev.filter(event => event.id !== payload.old.id))
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [leadId])

  return {
    lead,
    events,
    loading,
    error,
    fetchLead,
    updateLead,
    addEvent,
    refresh
  }
}