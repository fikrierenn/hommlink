// Bypass SSL certificate issues for development
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('🔄 Testing Supabase connection...')
console.log('URL:', supabaseUrl ? 'Set' : 'Missing')
console.log('Key:', supabaseKey ? 'Set' : 'Missing')

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  try {
    // Test basic connection
    console.log('🔄 Testing database connection...')
    const { data, error } = await supabase
      .from('status_definitions')
      .select('*')
      .limit(1)
    
    if (error) {
      console.error('❌ Database connection failed:', error.message)
      return false
    }
    
    console.log('✅ Database connection successful!')
    console.log('📊 Status definitions count:', data?.length || 0)
    
    // Test auth
    console.log('🔄 Testing auth service...')
    const { data: authData, error: authError } = await supabase.auth.getSession()
    
    if (authError) {
      console.error('❌ Auth service error:', authError.message)
    } else {
      console.log('✅ Auth service working!')
    }
    
    return true
    
  } catch (error) {
    console.error('❌ Connection error:', error.message)
    return false
  }
}

async function initializeDatabase() {
  try {
    console.log('🔄 Checking database schema...')
    
    // Check if status definitions exist
    const { data: statuses, error: statusError } = await supabase
      .from('status_definitions')
      .select('*')
    
    if (statusError) {
      console.error('❌ Status definitions table error:', statusError.message)
      return false
    }
    
    console.log('📊 Current status definitions:', statuses?.length || 0)
    
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
    } else {
      console.log('✅ Status definitions already exist')
      statuses.forEach(status => {
        console.log(`  - ${status.code}: ${status.label}`)
      })
    }
    
    // Check users table
    console.log('🔄 Checking users table...')
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(5)
    
    if (usersError) {
      console.error('❌ Users table error:', usersError.message)
    } else {
      console.log('📊 Current users count:', users?.length || 0)
      if (users && users.length > 0) {
        users.forEach(user => {
          console.log(`  - ${user.full_name} (${user.email}) - ${user.role}`)
        })
      }
    }
    
    // Check leads table
    console.log('🔄 Checking leads table...')
    const { data: leads, error: leadsError } = await supabase
      .from('leads')
      .select('*')
      .limit(5)
    
    if (leadsError) {
      console.error('❌ Leads table error:', leadsError.message)
    } else {
      console.log('📊 Current leads count:', leads?.length || 0)
      if (leads && leads.length > 0) {
        leads.forEach(lead => {
          console.log(`  - ${lead.name} (${lead.phone}) - ${lead.source}`)
        })
      }
    }
    
    return true
    
  } catch (error) {
    console.error('❌ Database initialization error:', error.message)
    return false
  }
}

async function createTestUser() {
  try {
    console.log('🔄 Creating test user...')
    
    const testEmail = 'test@example.com'
    const testPassword = '123456'
    const testName = 'Test Kullanıcı'
    
    // Try to sign up
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          full_name: testName
        }
      }
    })
    
    if (error) {
      if (error.message.includes('already registered')) {
        console.log('✅ Test user already exists')
        return true
      } else {
        console.error('❌ Failed to create test user:', error.message)
        return false
      }
    }
    
    console.log('✅ Test user created successfully!')
    console.log('📧 Email:', testEmail)
    console.log('🔑 Password:', testPassword)
    
    return true
    
  } catch (error) {
    console.error('❌ Test user creation error:', error.message)
    return false
  }
}

// Run tests
async function runTests() {
  console.log('🚀 Starting Supabase tests...\n')
  
  const connected = await testConnection()
  if (!connected) {
    console.log('❌ Connection failed, stopping tests')
    return
  }
  
  console.log('\n' + '='.repeat(50))
  await initializeDatabase()
  
  console.log('\n' + '='.repeat(50))
  await createTestUser()
  
  console.log('\n🎉 All tests completed!')
  console.log('\n📝 Test credentials:')
  console.log('   Email: test@example.com')
  console.log('   Password: 123456')
}

runTests()