#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables')
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

class SupabaseCLI {
  
  async testConnection() {
    try {
      console.log('🔄 Testing Supabase connection...')
      
      const { data, error } = await supabase
        .from('status_definitions')
        .select('count')
        .limit(1)
      
      if (error) {
        console.error('❌ Connection failed:', error.message)
        return false
      }
      
      console.log('✅ Supabase connection successful!')
      return true
      
    } catch (error) {
      console.error('❌ Connection error:', error.message)
      return false
    }
  }

  async initDatabase() {
    try {
      console.log('🔄 Initializing database...')
      
      // Create status definitions
      await this.createStatusDefinitions()
      
      console.log('✅ Database initialized successfully!')
      return true
      
    } catch (error) {
      console.error('❌ Database initialization failed:', error.message)
      return false
    }
  }

  async createStatusDefinitions() {
    // Check if already exists
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

  async showTables() {
    try {
      console.log('📊 Database Tables Info:')
      console.log('========================')
      
      const tables = ['users', 'status_definitions', 'leads', 'lead_events', 'whatsapp_templates']
      
      for (const table of tables) {
        try {
          const { data, error, count } = await supabase
            .from(table)
            .select('*', { count: 'exact' })
            .limit(3)
          
          if (error) {
            console.log(`❌ ${table}: Error - ${error.message}`)
          } else {
            console.log(`✅ ${table}: ${count || 0} records`)
            if (data && data.length > 0) {
              console.log(`   Sample:`, JSON.stringify(data[0], null, 2).substring(0, 200) + '...')
            }
          }
        } catch (err) {
          console.log(`❌ ${table}: ${err.message}`)
        }
        console.log('')
      }
      
    } catch (error) {
      console.error('❌ Error showing tables:', error.message)
    }
  }

  async createUser(email, fullName, role = 'agent') {
    try {
      console.log(`🔄 Creating user: ${email}`)
      
      // First create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: email,
        password: '123456', // Default password
        email_confirm: true,
        user_metadata: {
          full_name: fullName
        }
      })
      
      if (authError) {
        console.error('❌ Auth user creation failed:', authError.message)
        return false
      }
      
      // Then create profile
      const { data, error } = await supabase
        .from('users')
        .insert({
          auth_uid: authData.user.id,
          full_name: fullName,
          email: email,
          role: role
        })
        .select()
        .single()
      
      if (error) {
        console.error('❌ Profile creation failed:', error.message)
        return false
      }
      
      console.log('✅ User created successfully!')
      console.log('📧 Email:', email)
      console.log('🔑 Password: 123456')
      console.log('👤 Role:', role)
      
      return true
      
    } catch (error) {
      console.error('❌ User creation error:', error.message)
      return false
    }
  }

  async createLead(name, phone, city, ownerEmail) {
    try {
      console.log(`🔄 Creating lead: ${name}`)
      
      // Get owner user
      const { data: owner } = await supabase
        .from('users')
        .select('auth_uid')
        .eq('email', ownerEmail)
        .single()
      
      if (!owner) {
        console.error('❌ Owner not found:', ownerEmail)
        return false
      }
      
      // Get NEW status
      const { data: status } = await supabase
        .from('status_definitions')
        .select('id')
        .eq('code', 'NEW')
        .single()
      
      if (!status) {
        console.error('❌ NEW status not found')
        return false
      }
      
      const { data, error } = await supabase
        .from('leads')
        .insert({
          name: name,
          phone: phone,
          city: city,
          status_id: status.id,
          source: 'manual',
          owner_uid: owner.auth_uid
        })
        .select()
        .single()
      
      if (error) {
        console.error('❌ Lead creation failed:', error.message)
        return false
      }
      
      console.log('✅ Lead created successfully!')
      console.log('📝 Name:', name)
      console.log('📞 Phone:', phone)
      console.log('🏙️ City:', city)
      
      return true
      
    } catch (error) {
      console.error('❌ Lead creation error:', error.message)
      return false
    }
  }

  async showHelp() {
    console.log(`
🚀 Supabase CLI Tool for HommLink CRM
=====================================

Commands:
  test              Test Supabase connection
  init              Initialize database with required data
  tables            Show all tables and their record counts
  create-user       Create a new user
  create-lead       Create a new lead
  help              Show this help message

Examples:
  node scripts/supabase-cli.js test
  node scripts/supabase-cli.js init
  node scripts/supabase-cli.js tables
  node scripts/supabase-cli.js create-user test@example.com "Test User" agent
  node scripts/supabase-cli.js create-lead "Ahmet Yılmaz" "+905551234567" "İstanbul" test@example.com
`)
  }
}

// Main CLI handler
async function main() {
  const cli = new SupabaseCLI()
  const command = process.argv[2]
  
  switch (command) {
    case 'test':
      await cli.testConnection()
      break
      
    case 'init':
      if (await cli.testConnection()) {
        await cli.initDatabase()
      }
      break
      
    case 'tables':
      await cli.showTables()
      break
      
    case 'create-user':
      const email = process.argv[3]
      const fullName = process.argv[4]
      const role = process.argv[5] || 'agent'
      
      if (!email || !fullName) {
        console.error('❌ Usage: create-user <email> <fullName> [role]')
        process.exit(1)
      }
      
      await cli.createUser(email, fullName, role)
      break
      
    case 'create-lead':
      const leadName = process.argv[3]
      const phone = process.argv[4]
      const city = process.argv[5]
      const ownerEmail = process.argv[6]
      
      if (!leadName || !phone || !city || !ownerEmail) {
        console.error('❌ Usage: create-lead <name> <phone> <city> <ownerEmail>')
        process.exit(1)
      }
      
      await cli.createLead(leadName, phone, city, ownerEmail)
      break
      
    case 'help':
    default:
      cli.showHelp()
      break
  }
}

// Run CLI
main().catch(console.error)