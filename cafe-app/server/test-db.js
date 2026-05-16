require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
    console.log('Testing connection to Supabase...');
    try {
        const { data, error } = await supabase.from('NHANVIEN').select('*').limit(1);
        if (error) {
            console.error('Connection failed:', error.message);
        } else {
            console.log('Connection successful! Found data:', data);
        }
    } catch (err) {
        console.error('Error:', err);
    }
}

testConnection();
