import { supabase } from './supabase'

export async function testSupabaseConnection() {
  try {
    console.log('🔄 Testing Supabase connection...')
    
    // Test basic connection
    const { data, error } = await supabase
      .from('status_definitions')
      .select('*')
      .limit(1)
    
    if (error) {
      console.error('❌ Supabase connection failed:', error.message)
      return false
    }
    
    console.log('✅ Supabase connection successful!')
    console.log('📊 Sample data:', data)
    return true
    
  } catch (error) {
    console.error('❌ Supabase connection error:', error)
    return false
  }
}

export async function initializeDatabase() {
  try {
    console.log('🔄 Initializing database...')
    
    // Check if status definitions exist
    const { data: statuses, error: statusError } = await supabase
      .from('status_definitions')
      .select('*')
    
    if (statusError) {
      console.error('❌ Database check failed:', statusError.message)
      return false
    }
    
    if (!statuses || statuses.length === 0) {
      console.log('📝 Creating initial status definitions...')
      
      const initialStatuses = [
        { code: 'NEW', label: 'Yeni', color: '#D1FAE5', order_index: 10 },
        { code: 'TO_CALL', label: 'Aranacak', color: '#E0E7FF', order_index: 20 },
        { code: 'WA_SENT', label: 'Cevap Bekleniyor (WA)', color: '#FEF3C7', order_index: 40 },
        { code: 'APPT_SET', label: 'Randevu Verildi', color: '#FDE68A', order_index: 50 },
        { code: 'APPT_CONFIRMED', label: 'Randevu Onaylandı', color: '#FCD34D', order_index: 55 },
        { code: 'FOLLOW_UP', label: 'Takipte', color: '#DBEAFE', order_index: 60 },
        { code: 'QUALIFIED', label: 'Nitelikli', color: '#A7F3D0', order_index: 70 },
        { code: 'CLOSED', label: 'Kapanmış', color: '#E5E7EB', order_index: 90 }
      ]
      
      const { error: insertError } = await supabase
        .from('status_definitions')
        .insert(initialStatuses)
      
      if (insertError) {
        console.error('❌ Failed to create status definitions:', insertError.message)
        return false
      }
      
      console.log('✅ Status definitions created successfully!')
    }
    
    console.log('✅ Database initialized successfully!')
    return true
    
  } catch (error) {
    console.error('❌ Database initialization error:', error)
    return false
  }
}