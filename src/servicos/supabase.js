const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SB_URL, process.env.SB_KEY);

module.exports = supabase;