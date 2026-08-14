import { createClient } from '@supabase/supabase-js';

// Gunakan URL & Key dummy agar proyek bisa berjalan lokal tanpa file .env
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dummy.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy-anon-key-12345';

export const supabase = createClient(supabaseUrl, supabaseKey);