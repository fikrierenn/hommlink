import { DatabaseService } from '@/lib/database'
import type { 
  Lead, 
  LeadInsert, 
  LeadUpdate, 
  LeadEvent,
  LeadEventInsert,
  StatusDefinition,
  CallDisposition,
  DashboardStats,
  StatusDistribution,
  ConversionMetrics
} from '@/types'

export class LeadService {
  // Lead CRUD operations
  static async createLead(leadData: LeadInsert): Promise<Lead> {
    const newLead = await DatabaseService.createLead(leadData)
    
    // Log creation event
    await DatabaseService.createLeadEvent({
      lead_id: newLead.id,
      event_type: 'note',
      note: 'Aday oluşturuldu'
    })

    return newLead
  }

  // Status management
  static async updateLeadStatus(leadId: string, statusId: string, note?: string): Promise<Lead> {
    const updatedLead = await DatabaseService.updateLead(leadId, { status_id: statusId })
    
    // Log status change event
    await DatabaseService.createLeadEvent({
      lead_id: leadId,
      event_type: 'status_change',
      note: note || `Status changed to ${updatedLead.status?.label}`
    })

    return updatedLead
  }

  // Call management
  static async logCall(leadId: string, disposition: CallDisposition, notes?: string, duration?: number): Promise<void> {
    // Increment call count
    const lead = await DatabaseService.getLeadById(leadId)
    if (!lead) throw new Error('Lead not found')

    const newCallCount = (lead.call_count || 0) + 1
    
    // Update lead with new call count and last contact time
    await DatabaseService.updateLead(leadId, {
      call_count: newCallCount,
      last_contact_at: new Date().toISOString()
    })

    // Log call event
    await DatabaseService.createLeadEvent({
      lead_id: leadId,
      event_type: 'call',
      disposition,
      note: notes ? `${notes} (Süre: ${duration || 0}s, Toplam arama: ${newCallCount})` : `Arama yapıldı (Süre: ${duration || 0}s, Toplam: ${newCallCount})`
    })

    // Auto-update status based on call attempts
    if (disposition === 'unreachable' && newCallCount >= 3) {
      const unreachableStatus = await this.getStatusByCode('CLOSED')
      if (unreachableStatus) {
        await this.updateLeadStatus(leadId, unreachableStatus.id, 'Otomatik: 3 başarısız arama denemesi')
      }
    }
  }

  // WhatsApp integration
  static async logWhatsAppSent(leadId: string, templateCode: string, message: string): Promise<void> {
    // Update lead status to "waiting for response"
    const waitingStatus = await this.getStatusByCode('WA_SENT')
    if (waitingStatus) {
      await DatabaseService.updateLead(leadId, { 
        status_id: waitingStatus.id,
        last_contact_at: new Date().toISOString()
      })
    }

    // Log WhatsApp event
    await DatabaseService.createLeadEvent({
      lead_id: leadId,
      event_type: 'whatsapp',
      note: `WhatsApp mesajı gönderildi: ${templateCode} - ${message.substring(0, 100)}...`
    })
  }

  // Appointment management
  static async scheduleAppointment(leadId: string, appointmentDate: string, notes?: string): Promise<Lead> {
    // Update lead with appointment
    const updatedLead = await DatabaseService.updateLead(leadId, {
      appointment_date: appointmentDate,
      next_action: 'Randevu',
      next_action_at: appointmentDate
    })

    // Update status to appointment set
    const appointmentStatus = await this.getStatusByCode('APPT_SET')
    if (appointmentStatus) {
      await this.updateLeadStatus(leadId, appointmentStatus.id, notes || 'Randevu planlandı')
    }

    // Log appointment event
    await DatabaseService.createLeadEvent({
      lead_id: leadId,
      event_type: 'appointment',
      note: `${notes || 'Randevu planlandı'} - ${new Date(appointmentDate).toLocaleDateString('tr-TR')}`
    })

    return updatedLead
  }

  // Analytics and reporting
  static async getDashboardStats(ownerUid?: string): Promise<any> {
    // Simplified dashboard stats for now
    const today = new Date()
    const startOfWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString()

    const filters = ownerUid ? { owner_uid: ownerUid } : {}

    try {
      const [
        totalLeads,
        leadsThisWeek,
        leadsThisMonth
      ] = await Promise.all([
        DatabaseService.getLeads(filters, 1, 1),
        DatabaseService.getLeads({ ...filters, date_range: { start: startOfWeek, end: today.toISOString() } }, 1, 1),
        DatabaseService.getLeads({ ...filters, date_range: { start: startOfMonth, end: today.toISOString() } }, 1, 1)
      ])

      // Get leads that need calls (status = NEW or TO_CALL)
      const callNeededStatuses = await DatabaseService.getStatusDefinitions()
      const callNeededStatusIds = callNeededStatuses
        .filter(s => ['NEW', 'TO_CALL'].includes(s.code))
        .map(s => s.id)
      
      const callsNeeded = callNeededStatusIds.length > 0 
        ? await DatabaseService.getLeads({ ...filters, status_ids: callNeededStatusIds }, 1, 1)
        : { count: 0 }

      // Get appointments set (status = APPT_SET or APPT_CONFIRMED)
      const appointmentStatusIds = callNeededStatuses
        .filter(s => ['APPT_SET', 'APPT_CONFIRMED'].includes(s.code))
        .map(s => s.id)
      
      const appointmentsSet = appointmentStatusIds.length > 0
        ? await DatabaseService.getLeads({ ...filters, status_ids: appointmentStatusIds }, 1, 1)
        : { count: 0 }

      return {
        totalLeads: totalLeads.count,
        newLeadsToday: Math.floor(Math.random() * 5) + 1, // Mock data for now
        newLeadsThisWeek: leadsThisWeek.count,
        newLeadsThisMonth: leadsThisMonth.count,
        callsNeeded: callsNeeded.count,
        appointmentsSet: appointmentsSet.count,
        conversionRate: totalLeads.count > 0 ? Math.round((appointmentsSet.count / totalLeads.count) * 100) : 0,
        totalCalls: Math.floor(Math.random() * 50) + 20, // Mock data
        callSuccessRate: Math.floor(Math.random() * 30) + 60, // Mock data
        whatsappSent: Math.floor(Math.random() * 30) + 10, // Mock data
        whatsappResponseRate: Math.floor(Math.random() * 20) + 70 // Mock data
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
      // Return default stats on error
      return {
        totalLeads: 0,
        newLeadsToday: 0,
        newLeadsThisWeek: 0,
        newLeadsThisMonth: 0,
        callsNeeded: 0,
        appointmentsSet: 0,
        conversionRate: 0,
        totalCalls: 0,
        callSuccessRate: 0,
        whatsappSent: 0,
        whatsappResponseRate: 0
      }
    }
  }

  static async getRecentActivities(ownerUid?: string, limit: number = 10): Promise<any[]> {
    try {
      // Get recent leads for activity feed
      const recentLeads = await DatabaseService.getLeads(
        ownerUid ? { owner_uid: ownerUid } : {},
        1,
        limit
      )

      // Convert leads to activity format
      const activities = recentLeads.data.map((lead, index) => ({
        id: `activity-${lead.id}`,
        type: 'lead_created',
        leadName: lead.name,
        leadId: lead.id,
        description: `Yeni aday eklendi: ${lead.name}`,
        createdAt: lead.created_at
      }))

      // Add some mock activities for better demo
      const mockActivities = [
        {
          id: 'mock-1',
          type: 'whatsapp_sent',
          leadName: 'Ahmet Yılmaz',
          leadId: 'mock-lead-1',
          description: 'WhatsApp mesajı gönderildi',
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
        },
        {
          id: 'mock-2',
          type: 'call_made',
          leadName: 'Fatma Demir',
          leadId: 'mock-lead-2',
          description: 'Görüşme yapıldı',
          createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString() // 5 hours ago
        },
        {
          id: 'mock-3',
          type: 'appointment_set',
          leadName: 'Mehmet Kaya',
          leadId: 'mock-lead-3',
          description: 'Randevu planlandı',
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // 1 day ago
        }
      ]

      return [...mockActivities, ...activities].slice(0, limit)
    } catch (error) {
      console.error('Error fetching recent activities:', error)
      return []
    }
  }

  static async getStatusDistribution(ownerUid?: string): Promise<StatusDistribution[]> {
    const statuses = await DatabaseService.getStatusDefinitions()
    const filters = ownerUid ? { owner_uid: ownerUid } : {}
    const totalLeads = await DatabaseService.getLeads(filters, 1, 1)

    const distribution: StatusDistribution[] = []

    for (const status of statuses) {
      const statusLeads = await DatabaseService.getLeads({
        ...filters,
        status_ids: [status.id]
      }, 1, 1)

      distribution.push({
        status,
        count: statusLeads.count,
        percentage: totalLeads.count > 0 ? (statusLeads.count / totalLeads.count) * 100 : 0
      })
    }

    return distribution
  }

  // Utility methods
  private static async getStatusByCode(code: string): Promise<StatusDefinition | null> {
    const statuses = await DatabaseService.getStatusDefinitions()
    return statuses.find(s => s.code === code) || null
  }

  // Search and filtering helpers
  static buildSearchQuery(query: string): string {
    // Clean and prepare search query for database
    return query.trim().toLowerCase()
  }

  static validatePhoneNumber(phone: string): boolean {
    // Turkish mobile phone validation
    const turkishPhoneRegex = /^(\+90|0)?[5][0-9]{9}$/
    return turkishPhoneRegex.test(phone.replace(/\s/g, ''))
  }

  static normalizePhoneNumber(phone: string): string {
    // Normalize Turkish phone number
    const cleaned = phone.replace(/\D/g, '')
    
    if (cleaned.length === 10) {
      return `0${cleaned}`
    }
    if (cleaned.length === 13 && cleaned.startsWith('90')) {
      return `0${cleaned.slice(2)}`
    }
    if (cleaned.length === 11 && cleaned.startsWith('0')) {
      return cleaned
    }
    
    return phone // Return original if can't normalize
  }

  // Bulk operations
  static async bulkUpdateStatus(leadIds: string[], statusId: string, note?: string): Promise<void> {
    const promises = leadIds.map(id => this.updateLeadStatus(id, statusId, note))
    await Promise.all(promises)
  }

  static async exportLeads(filters?: any): Promise<Lead[]> {
    // Get all leads matching filters (no pagination)
    const result = await DatabaseService.getLeads(filters, 1, 10000)
    return result.data
  }
}