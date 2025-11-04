import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// Database types
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          auth_uid: string
          full_name: string
          role: 'agent' | 'admin'
          phone: string | null
          email: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          auth_uid: string
          full_name: string
          role?: 'agent' | 'admin'
          phone?: string | null
          email?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          auth_uid?: string
          full_name?: string
          role?: 'agent' | 'admin'
          phone?: string | null
          email?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      status_definitions: {
        Row: {
          id: number
          code: string
          label: string
          color: string
          order_index: number
          is_active: boolean
        }
        Insert: {
          code: string
          label: string
          color: string
          order_index?: number
          is_active?: boolean
        }
        Update: {
          id?: number
          code?: string
          label?: string
          color?: string
          order_index?: number
          is_active?: boolean
        }
      }
      leads: {
        Row: {
          id: string
          external_id: string | null
          source: string
          name: string
          phone: string
          region: string | null
          city: string | null
          status_id: number | null
          notes: string | null
          next_action: string | null
          next_action_at: string | null
          call_count: number
          owner_uid: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          external_id?: string | null
          source?: string
          name: string
          phone: string
          region?: string | null
          city?: string | null
          status_id?: number | null
          notes?: string | null
          next_action?: string | null
          next_action_at?: string | null
          call_count?: number
          owner_uid: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          external_id?: string | null
          source?: string
          name?: string
          phone?: string
          region?: string | null
          city?: string | null
          status_id?: number | null
          notes?: string | null
          next_action?: string | null
          next_action_at?: string | null
          call_count?: number
          owner_uid?: string
          created_at?: string
          updated_at?: string
        }
      }
      lead_events: {
        Row: {
          id: number
          lead_id: string
          event_type: 'call' | 'whatsapp' | 'status_change' | 'note' | 'appointment'
          disposition: string | null
          note: string | null
          created_by: string
          created_at: string
        }
        Insert: {
          lead_id: string
          event_type: 'call' | 'whatsapp' | 'status_change' | 'note' | 'appointment'
          disposition?: string | null
          note?: string | null
          created_by: string
        }
        Update: {
          id?: number
          lead_id?: string
          event_type?: 'call' | 'whatsapp' | 'status_change' | 'note' | 'appointment'
          disposition?: string | null
          note?: string | null
          created_by?: string
        }
      }
      whatsapp_templates: {
        Row: {
          id: number
          code: string
          name: string
          message: string
          variables: string[]
          is_active: boolean
          created_at: string
        }
        Insert: {
          code: string
          name: string
          message: string
          variables?: string[]
          is_active?: boolean
        }
        Update: {
          id?: number
          code?: string
          name?: string
          message?: string
          variables?: string[]
          is_active?: boolean
        }
      }
    }
  }
}

// Typed Supabase client
export const supabaseTyped = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// Export types for use in other files
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']