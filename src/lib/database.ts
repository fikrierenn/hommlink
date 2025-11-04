import { supabase } from './supabase'
import type { 
  Lead, 
  LeadInsert, 
  LeadUpdate, 
  LeadEvent, 
  LeadEventInsert,
  StatusDefinition,
  WhatsAppTemplate,
  User,
  LeadFilters,
  PaginatedResponse
} from '@/types'

// Error handling utility
class DatabaseError extends Error {
  constructor(message: string, public originalError?: any) {
    super(message)
    this.name = 'DatabaseError'
  }
}

// Generic database operations
export class DatabaseService {
  // Leads operations
  static async getLeads(filters?: LeadFilters, page = 1, limit = 20): Promise<PaginatedResponse<Lead>> {
    try {
      let query = supabase
        .from('leads')
        .select(`
          *,
          status:status_definitions(*),
          owner:users(*)
        `)

      // Apply filters
      if (filters?.status_ids?.length) {
        query = query.in('status_id', filters.status_ids)
      }

      if (filters?.regions?.length) {
        query = query.in('region', filters.regions)
      }

      if (filters?.cities?.length) {
        query = query.in('city', filters.cities)
      }

      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,phone.ilike.%${filters.search}%,notes.ilike.%${filters.search}%`)
      }

      if (filters?.date_range) {
        query = query
          .gte('created_at', filters.date_range.start)
          .lte('created_at', filters.date_range.end)
      }

      if (filters?.owner_uid) {
        query = query.eq('owner_uid', filters.owner_uid)
      }

      // Get total count
      const { count } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })

      // Apply pagination and ordering
      const { data, error } = await query
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1)

      if (error) throw new DatabaseError('Failed to fetch leads', error)

      return {
        data: data || [],
        count: count || 0,
        page,
        limit,
        hasMore: (count || 0) > page * limit
      }
    } catch (error) {
      console.error('Error fetching leads:', error)
      throw error instanceof DatabaseError ? error : new DatabaseError('Failed to fetch leads', error)
    }
  }

  static async getLeadById(id: string): Promise<Lead | null> {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select(`
          *,
          status:status_definitions(*),
          owner:users(*)
        `)
        .eq('id', id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') return null // Not found
        throw new DatabaseError('Failed to fetch lead', error)
      }

      return data
    } catch (error) {
      console.error('Error fetching lead:', error)
      throw error instanceof DatabaseError ? error : new DatabaseError('Failed to fetch lead', error)
    }
  }

  static async createLead(leadData: LeadInsert): Promise<Lead> {
    try {
      console.log('🔍 Creating lead with data:', leadData)
      
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) throw new DatabaseError('User not authenticated')
      
      console.log('👤 User authenticated:', user.user.id)

      // Remove undefined values and call_count (not in database yet)
      const insertData = {
        name: leadData.name,
        phone: leadData.phone,
        source: leadData.source,
        owner_uid: user.user.id
      }
      
      // Add optional fields only if they have values
      if (leadData.region) insertData.region = leadData.region
      if (leadData.city) insertData.city = leadData.city
      if (leadData.notes) insertData.notes = leadData.notes
      if (leadData.status_id) insertData.status_id = leadData.status_id
      if (leadData.next_action) insertData.next_action = leadData.next_action
      if (leadData.next_action_at) insertData.next_action_at = leadData.next_action_at
      
      console.log('📝 Insert data:', insertData)

      const { data, error } = await supabase
        .from('leads')
        .insert(insertData)
        .select(`
          *,
          status:status_definitions(*),
          owner:users(*)
        `)
        .single()

      if (error) {
        console.error('❌ Supabase create lead error:', error)
        console.error('Error code:', error.code)
        console.error('Error message:', error.message)
        console.error('Error details:', error.details)
        console.error('Error hint:', error.hint)
        throw new DatabaseError(`Failed to create lead: ${error.message} (${error.code})`, error)
      }

      console.log('✅ Lead created successfully:', data)
      return data
    } catch (error) {
      console.error('💥 Error creating lead:', error)
      throw error instanceof DatabaseError ? error : new DatabaseError('Failed to create lead', error)
    }
  }

  static async updateLead(id: string, updates: LeadUpdate): Promise<Lead> {
    try {
      const { data, error } = await supabase
        .from('leads')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          status:status_definitions(*),
          owner:users(*)
        `)
        .single()

      if (error) throw new DatabaseError('Failed to update lead', error)

      return data
    } catch (error) {
      console.error('Error updating lead:', error)
      throw error instanceof DatabaseError ? error : new DatabaseError('Failed to update lead', error)
    }
  }

  static async deleteLead(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', id)

      if (error) throw new DatabaseError('Failed to delete lead', error)
    } catch (error) {
      console.error('Error deleting lead:', error)
      throw error instanceof DatabaseError ? error : new DatabaseError('Failed to delete lead', error)
    }
  }

  // Lead Events operations
  static async getLeadEvents(leadId: string): Promise<LeadEvent[]> {
    try {
      const { data, error } = await supabase
        .from('lead_events')
        .select('*')
        .eq('lead_id', leadId)
        .order('created_at', { ascending: false })

      if (error) throw new DatabaseError('Failed to fetch lead events', error)

      return data || []
    } catch (error) {
      console.error('Error fetching lead events:', error)
      throw error instanceof DatabaseError ? error : new DatabaseError('Failed to fetch lead events', error)
    }
  }

  static async createLeadEvent(eventData: LeadEventInsert): Promise<LeadEvent> {
    try {
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) throw new DatabaseError('User not authenticated')

      const insertData = {
        ...eventData,
        created_by: user.user.id
      }

      const { data, error } = await supabase
        .from('lead_events')
        .insert(insertData)
        .select('*')
        .single()

      if (error) throw new DatabaseError('Failed to create lead event', error)

      return data
    } catch (error) {
      console.error('Error creating lead event:', error)
      throw error instanceof DatabaseError ? error : new DatabaseError('Failed to create lead event', error)
    }
  }

  // Status Definitions operations
  static async getStatusDefinitions(): Promise<StatusDefinition[]> {
    try {
      const { data, error } = await supabase
        .from('status_definitions')
        .select('*')
        .eq('is_active', true)
        .order('order_index', { ascending: true })

      if (error) throw new DatabaseError('Failed to fetch status definitions', error)

      return data || []
    } catch (error) {
      console.error('Error fetching status definitions:', error)
      throw error instanceof DatabaseError ? error : new DatabaseError('Failed to fetch status definitions', error)
    }
  }

  // WhatsApp Templates operations
  static async getWhatsAppTemplates(): Promise<WhatsAppTemplate[]> {
    try {
      const { data, error } = await supabase
        .from('whatsapp_templates')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true })

      if (error) throw new DatabaseError('Failed to fetch WhatsApp templates', error)

      return data || []
    } catch (error) {
      console.error('Error fetching WhatsApp templates:', error)
      throw error instanceof DatabaseError ? error : new DatabaseError('Failed to fetch WhatsApp templates', error)
    }
  }

  // Users operations
  static async getCurrentUserProfile(): Promise<User | null> {
    try {
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) return null

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('auth_uid', user.user.id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') return null // Not found
        throw new DatabaseError('Failed to fetch user profile', error)
      }

      return data
    } catch (error) {
      console.error('Error fetching user profile:', error)
      throw error instanceof DatabaseError ? error : new DatabaseError('Failed to fetch user profile', error)
    }
  }

  // Real-time subscriptions
  static subscribeToLeads(callback: (payload: any) => void) {
    return supabase
      .channel('leads-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'leads' }, 
        callback
      )
      .subscribe()
  }

  static subscribeToLeadEvents(leadId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`lead-events-${leadId}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'lead_events',
          filter: `lead_id=eq.${leadId}`
        }, 
        callback
      )
      .subscribe()
  }
}

export { DatabaseError }