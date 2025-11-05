'use client'

import { useState, useEffect } from 'react'
import { LeadService } from '@/services/leadService'
import { useAuth } from '@/contexts/AuthContext'

export interface DashboardStats {
  totalLeads: number
  newLeadsToday: number
  newLeadsThisWeek: number
  newLeadsThisMonth: number
  callsNeeded: number
  appointmentsSet: number
  conversionRate: number
  totalCalls: number
  callSuccessRate: number
  whatsappSent: number
  whatsappResponseRate: number
}

export interface RecentActivity {
  id: string
  type: 'lead_created' | 'call_made' | 'whatsapp_sent' | 'status_changed' | 'appointment_set'
  leadName: string
  leadId: string
  description: string
  createdAt: string
}

export function useDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDashboardData = async () => {
    if (!user) return

    try {
      setLoading(true)
      setError(null)

      // Fetch dashboard stats
      const dashboardStats = await LeadService.getDashboardStats(user.id)
      setStats(dashboardStats)

      // Fetch recent activities
      const activities = await LeadService.getRecentActivities(user.id, 10)
      setRecentActivities(activities)

    } catch (err) {
      console.error('Error fetching dashboard data:', err)
      setError('Dashboard verileri yüklenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [user])

  const refresh = () => {
    fetchDashboardData()
  }

  return {
    stats,
    recentActivities,
    loading,
    error,
    refresh
  }
}