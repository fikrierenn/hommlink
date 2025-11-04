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
  static async getDashboardStats(ownerUid?: string): Promise<DashboardStats> {
    // This would typically be implemented with database views or stored procedures
    // For now, we'll use multiple queries (not optimal for production)
    
    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString()
    const startOfWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString()

    const filters = ownerUid ? { owner_uid: ownerUid } : {}

    const [
      totalLeads,
      leadsToday,
      leadsThisWeek,
      leadsThisMonth
    ] = await Promise.all([
      DatabaseService.getLeads(filters, 1, 1),
      DatabaseService.getLeads({ ...filters, date_range: { start: startOfDay, end: today.toISOString() } }, 1, 1),
      DatabaseService.getLeads({ ...filters, date_range: { start: startOfWeek, end: today.toISOString() } }, 1, 1),
      DatabaseService.getLeads({ ...filters, date_range: { start: startOfMonth, end: today.toISOString() } }, 1, 1)
    ])

    // TODO: Implement call and WhatsApp stats from lead_events table
    return {
      total_leads: totalLeads.count,
      new_leads_today: leadsToday.count,
      new_leads_this_week: leadsThisWeek.count,
      new_leads_this_month: leadsThisMonth.count,
      calls_today: 0, // TODO: Implement
      calls_this_week: 0, // TODO: Implement
      calls_this_month: 0, // TODO: Implement
      appointments_today: 0, // TODO: Implement
      appointments_this_week: 0, // TODO: Implement
      appointments_this_month: 0, // TODO: Implement
      whatsapp_sent_today: 0, // TODO: Implement
      whatsapp_sent_this_week: 0, // TODO: Implement
      whatsapp_sent_this_month: 0 // TODO: Implement
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