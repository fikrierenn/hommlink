import { supabase } from './supabase'

export class SupabaseAdmin {
  
  // Database connection test
  async testConnection() {
    try {
      console.log('🔄 Testing Supabase connection...')
      
      const { data, error } = await supabase
        .from('status_definitions')
        .select('count')
        .limit(1)
      
      if (error) {
        console.error('❌ Connection failed:', error.message)
        return { success: false, error: error.message }
      }
      
      console.log('✅ Supabase connection successful!')
      return { success: true, data }
      
    } catch (error) {
      console.error('❌ Connection error:', error)
      return { success: false, error: String(error) }
    }
  }

  // Initialize database with required tables and data
  async initializeDatabase() {
    try {
      console.log('🔄 Initializing database...')
      
      // Create status definitions if they don't exist
      await this.createStatusDefinitions()
      
      // Create sample user if needed
      await this.createSampleData()
      
      console.log('✅ Database initialized successfully!')
      return { success: true }
      
    } catch (error) {
      console.error('❌ Database initialization failed:', error)
      return { success: false, error: String(error) }
    }
  }

  // Create initial status definitions
  async createStatusDefinitions() {
    const { data: existing } = await supabase
      .from('status_definitions')
      .select('*')
      .limit(1)
    
    if (existing && existing.length > 0) {
      console.log('📋 Status definitions already exist')
      return
    }
    
    console.log('📝 Creating status definitions...')
    
    const statuses = [
      { code: 'NEW', label: 'Yeni', color: '#10B981', order_index: 10 },
      { code: 'TO_CALL', label: 'Aranacak', color: '#3B82F6', order_index: 20 },
      { code: 'CALLED', label: 'Arandı', color: '#8B5CF6', order_index: 30 },
      { code: 'WA_SENT', label: 'Cevap Bekleniyor (WA)', color: '#F59E0B', order_index: 40 },
      { code: 'APPT_SET', label: 'Randevu Verildi', color: '#EF4444', order_index: 50 },
      { code: 'APPT_CONFIRMED', label: 'Randevu Onaylandı', color: '#F97316', order_index: 55 },
      { code: 'FOLLOW_UP', label: 'Takipte', color: '#06B6D4', order_index: 60 },
      { code: 'QUALIFIED', label: 'Nitelikli', color: '#10B981', order_index: 70 },
      { code: 'NOT_INTERESTED', label: 'İlgisiz', color: '#6B7280', order_index: 80 },
      { code: 'CLOSED', label: 'Kapanmış', color: '#374151', order_index: 90 }
    ]
    
    const { error } = await supabase
      .from('status_definitions')
      .insert(statuses)
    
    if (error) {
      throw new Error(`Failed to create status definitions: ${error.message}`)
    }
    
    console.log('✅ Status definitions created')
  }

  // Create sample data for testing
  async createSampleData() {
    // Check if we have any leads
    const { data: leads } = await supabase
      .from('leads')
      .select('*')
      .limit(1)
    
    if (leads && leads.length > 0) {
      console.log('📋 Sample data already exists')
      return
    }
    
    console.log('📝 Creating sample data...')
    
    // Get first status for sample leads
    const { data: statuses } = await supabase
      .from('status_definitions')
      .select('*')
      .eq('code', 'NEW')
      .single()
    
    if (!statuses) {
      console.log('⚠️ No status found, skipping sample data')
      return
    }
    
    // Create sample leads (only if we have a user)
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      const sampleLeads = [
        {
          name: 'Ahmet Yılmaz',
          phone: '+905551234567',
          city: 'İstanbul',
          region: 'Marmara',
          status_id: statuses.id,
          source: 'whatsapp',
          notes: 'WhatsApp üzerinden ulaştı, temsilcilik hakkında bilgi almak istiyor.',
          owner_uid: user.id
        },
        {
          name: 'Fatma Demir',
          phone: '+905559876543',
          city: 'Ankara',
          region: 'İç Anadolu',
          status_id: statuses.id,
          source: 'referral',
          notes: 'Arkadaşı tarafından yönlendirildi.',
          owner_uid: user.id
        },
        {
          name: 'Mehmet Kaya',
          phone: '+905555555555',
          city: 'İzmir',
          region: 'Ege',
          status_id: statuses.id,
          source: 'website',
          notes: 'Web sitesinden form doldurdu.',
          owner_uid: user.id
        }
      ]
      
      const { error } = await supabase
        .from('leads')
        .insert(sampleLeads)
      
      if (error) {
        console.log('⚠️ Could not create sample leads:', error.message)
      } else {
        console.log('✅ Sample leads created')
      }
    }
  }

  // Get all tables info
  async getTablesInfo() {
    try {
      const tables = ['users', 'status_definitions', 'leads', 'lead_events', 'whatsapp_templates']
      const info: Record<string, any> = {}
      
      for (const table of tables) {
        const { data, error, count } = await supabase
          .from(table)
          .select('*', { count: 'exact' })
          .limit(5)
        
        info[table] = {
          count: count || 0,
          sample: data || [],
          error: error?.message
        }
      }
      
      return { success: true, data: info }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  // Create a new user in the users table
  async createUser(userData: {
    authUid: string
    fullName: string
    email: string
    phone?: string
    role?: 'agent' | 'admin'
  }) {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert({
          auth_uid: userData.authUid,
          full_name: userData.fullName,
          email: userData.email,
          phone: userData.phone,
          role: userData.role || 'agent'
        })
        .select()
        .single()
      
      if (error) {
        return { success: false, error: error.message }
      }
      
      return { success: true, data }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  // Get all status definitions
  async getStatusDefinitions() {
    try {
      const { data, error } = await supabase
        .from('status_definitions')
        .select('*')
        .order('order_index')
      
      if (error) {
        return { success: false, error: error.message }
      }
      
      return { success: true, data }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  // Create a new lead
  async createLead(leadData: {
    name: string
    phone: string
    city?: string
    region?: string
    statusCode?: string
    source?: string
    notes?: string
    ownerUid: string
  }) {
    try {
      // Get status ID from code
      let statusId = null
      if (leadData.statusCode) {
        const { data: status } = await supabase
          .from('status_definitions')
          .select('id')
          .eq('code', leadData.statusCode)
          .single()
        
        statusId = status?.id
      }
      
      // If no status provided or found, use NEW
      if (!statusId) {
        const { data: newStatus } = await supabase
          .from('status_definitions')
          .select('id')
          .eq('code', 'NEW')
          .single()
        
        statusId = newStatus?.id
      }
      
      const { data, error } = await supabase
        .from('leads')
        .insert({
          name: leadData.name,
          phone: leadData.phone,
          city: leadData.city,
          region: leadData.region,
          status_id: statusId,
          source: leadData.source || 'manual',
          notes: leadData.notes,
          owner_uid: leadData.ownerUid
        })
        .select()
        .single()
      
      if (error) {
        return { success: false, error: error.message }
      }
      
      return { success: true, data }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  // Get leads with filters
  async getLeads(filters?: {
    ownerUid?: string
    statusCode?: string
    search?: string
    limit?: number
  }) {
    try {
      let query = supabase
        .from('leads')
        .select(`
          *,
          status:status_definitions(*)
        `)
        .order('created_at', { ascending: false })
      
      if (filters?.ownerUid) {
        query = query.eq('owner_uid', filters.ownerUid)
      }
      
      if (filters?.statusCode) {
        const { data: status } = await supabase
          .from('status_definitions')
          .select('id')
          .eq('code', filters.statusCode)
          .single()
        
        if (status) {
          query = query.eq('status_id', status.id)
        }
      }
      
      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,phone.ilike.%${filters.search}%,notes.ilike.%${filters.search}%`)
      }
      
      if (filters?.limit) {
        query = query.limit(filters.limit)
      }
      
      const { data, error } = await query
      
      if (error) {
        return { success: false, error: error.message }
      }
      
      return { success: true, data }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  // Update lead status
  async updateLeadStatus(leadId: string, statusCode: string) {
    try {
      // Get status ID from code
      const { data: status } = await supabase
        .from('status_definitions')
        .select('id')
        .eq('code', statusCode)
        .single()
      
      if (!status) {
        return { success: false, error: `Status not found: ${statusCode}` }
      }
      
      const { data, error } = await supabase
        .from('leads')
        .update({ 
          status_id: status.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', leadId)
        .select()
        .single()
      
      if (error) {
        return { success: false, error: error.message }
      }
      
      return { success: true, data }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  // Clean up database (for testing)
  async cleanupDatabase() {
    try {
      console.log('🧹 Cleaning up database...')
      
      // Delete in correct order due to foreign keys
      await supabase.from('lead_events').delete().neq('id', '00000000-0000-0000-0000-000000000000')
      await supabase.from('leads').delete().neq('id', '00000000-0000-0000-0000-000000000000')
      await supabase.from('users').delete().neq('id', '00000000-0000-0000-0000-000000000000')
      await supabase.from('status_definitions').delete().neq('id', '00000000-0000-0000-0000-000000000000')
      
      console.log('✅ Database cleaned up')
      return { success: true }
    } catch (error) {
      console.error('❌ Cleanup failed:', error)
      return { success: false, error: String(error) }
    }
  }
}

// Export singleton instance
export const supabaseAdmin = new SupabaseAdmin()