import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rpzyoeetqnjwssfapgsc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwenlvZWV0cW5qd3NzZmFwZ3NjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyNDk2NTksImV4cCI6MjA4OTgyNTY1OX0.nu5tpCjOoKMjfzt86FJR6f9Puqfuqunypu2vjfTfa_c';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
