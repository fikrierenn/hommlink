const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
require('dotenv').config({ path: 'HommLink/hommlink-crm-web/.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('🔧 Fixing database schema...')
console.log('URL:', supabaseUrl)
console.log('Service Key exists:', !!supabaseServiceKey)

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function fixDatabase() {
  try {
    // Read the fix SQL
    const sqlContent = fs.readFileSync('HommLink/hommlink-crm-web/database/fix-missing-columns.sql', 'utf8')
    
    console.log('📝 Executing fix SQL...')
    
    // Execute the SQL using raw query
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: sqlContent
    })
    
    if (error) {
      console.error('❌ Error executing SQL:', error)
    } else {
      console.log('✅ Database fix completed successfully')
      console.log('Result:', data)
    }
    
    // Test lead creation
    console.log('\n🧪 Testing lead creation...')
    
    const testLead = {
      name: 'Test User',
      phone: '05551234567',
      source: 'test',
      region: 'Test Region',
      city: 'Test City',
      owner_uid: '0691285a-7d26-44b7-9016-517ce3d8f8cf'
    }
    
    const { data: newLead, error: createError } = await supabase
      .from('leads')
      .insert(testLead)
      .select()
      .single()
    
    if (createError) {
      console.error('❌ Test lead creation failed:', createError)
    } else {
      console.log('✅ Test lead created successfully:', newLead.id)
      
      // Clean up test lead
      await supabase.from('leads').delete().eq('id', newLead.id)
      console.log('🧹 Test lead cleaned up')
    }
    
  } catch (error) {
    console.error('💥 Fix failed:', error)
  }
}

fixDatabase()