const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = process.env.SUPABASE_URL || ''
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || ''

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.warn('Supabase URL or KEY not set. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY')
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

module.exports = supabase
