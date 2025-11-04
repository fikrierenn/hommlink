const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function runSQL() {
  try {
    console.log('🚀 Setting up HommLink CRM database...')
    
    // Read SQL file
    const sqlPath = path.join(__dirname, '..', 'database', 'schema.sql')
    const sqlContent = fs.readFileSync(sqlPath, 'utf8')
    
    // Split SQL into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`)
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      if (statement.trim()) {
        console.log(`🔄 Executing statement ${i + 1}/${statements.length}...`)
        
        try {
          const { data, error } = await supabase.rpc('exec_sql', {
            sql: statement + ';'
          })
          
          if (error) {
            // Some errors are expected (like "already exists")
            if (error.message.includes('already exists') || 
                error.message.includes('duplicate key') ||
                error.message.includes('relation') && error.message.includes('already exists')) {
              console.log(`ℹ️  Statement ${i + 1}: ${error.message} (continuing...)`)
            } else {
              console.error(`❌ Error in statement ${i + 1}:`, error.message)
              console.log('Statement:', statement.substring(0, 100) + '...')
            }
          } else {
            console.log(`✅ Statement ${i + 1} executed successfully`)
          }
        } catch (err) {
          console.error(`❌ Exception in statement ${i + 1}:`, err.message)
        }
      }
    }
    
    // Test the setup by checking tables
    console.log('🔍 Verifying database setup...')
    
    const tables = ['users', 'status_definitions', 'leads', 'lead_events', 'whatsapp_templates']
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1)
        
        if (error) {
          console.log(`❌ Table ${table}: ${error.message}`)
        } else {
          console.log(`✅ Table ${table}: OK`)
        }
      } catch (err) {
        console.log(`❌ Table ${table}: ${err.message}`)
      }
    }
    
    console.log('🎉 Database setup completed!')
    console.log('📱 You can now test the application at http://localhost:3000')
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message)
    process.exit(1)
  }
}

runSQL()