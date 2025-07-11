import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gkwacvdbsqdnoaschbna.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdrd2FjdmRic3Fkbm9hc2NoYm5hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4MjY0NTksImV4cCI6MjA2NzQwMjQ1OX0.3EEVab6BQMMDZWJofgEdsGuI1hYpKAEgu26nKo13_0E';

export const supabase = createClient(supabaseUrl, supabaseAnonKey); 