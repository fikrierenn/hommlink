'use client'

import { useState, useEffect, useCallback } from 'react'
import { DatabaseService } from '@/lib/database'
import type { WhatsAppTemplate } from '@/types'

interface UseWhatsAppTemplatesReturn {
  templates: WhatsAppTemplate[]
  loading: boolean
  error: string | null
  fetchTemplates: () => Promise<void>
  getTemplateByCode: (code: string) => WhatsAppTemplate | undefined
  personalizeMessage: (template: WhatsAppTemplate, variables: Record<string, string>) => string
}

export function useWhatsAppTemplates(): UseWhatsAppTemplatesReturn {
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTemplates = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const data = await DatabaseService.getWhatsAppTemplates()
      setTemplates(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch WhatsApp templates'
      setError(errorMessage)
      console.error('Error fetching WhatsApp templates:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const getTemplateByCode = useCallback((code: string) => {
    return templates.find(template => template.code === code)
  }, [templates])

  const personalizeMessage = useCallback((template: WhatsAppTemplate, variables: Record<string, string>) => {
    let message = template.message

    // Replace variables in the message
    template.variables.forEach(variable => {
      const value = variables[variable] || `{{${variable}}}`
      const regex = new RegExp(`{{${variable}}}`, 'g')
      message = message.replace(regex, value)
    })

    return message
  }, [])

  // Auto-fetch on mount
  useEffect(() => {
    fetchTemplates()
  }, [fetchTemplates])

  return {
    templates,
    loading,
    error,
    fetchTemplates,
    getTemplateByCode,
    personalizeMessage
  }
}