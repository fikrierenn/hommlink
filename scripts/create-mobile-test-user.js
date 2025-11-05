const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createTestUser() {
  try {
    console.log('🔧 Creating test user for mobile testing...')

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'test@example.com',
      password: '123456',
      email_confirm: true,
      user_metadata: {
        full_name: 'Test Kullanıcı'
      }
    })

    if (authError) {
      if (authError.message.includes('already registered')) {
        console.log('✅ Test user already exists')
        return
      }
      throw authError
    }

    console.log('✅ Auth user created:', authData.user.id)

    // Create user profile
    const { error: profileError } = await supabase
      .from('users')
      .upsert({
        auth_uid: authData.user.id,
        full_name: 'Test Kullanıcı',
        email: 'test@example.com',
        role: 'agent',
        is_active: true
      })

    if (profileError) {
      console.error('❌ Profile creation error:', profileError)
    } else {
      console.log('✅ User profile created')
    }

    console.log('🎉 Test user ready!')
    console.log('📧 Email: test@example.com')
    console.log('🔑 Password: 123456')

  } catch (error) {
    console.error('❌ Error creating test user:', error)
  }
}

createTestUser()