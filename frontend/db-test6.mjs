import { createClient } from '@supabase/supabase-js';
const supabase = createClient('https://rpzyoeetqnjwssfapgsc.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwenlvZWV0cW5qd3NzZmFwZ3NjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyNDk2NTksImV4cCI6MjA4OTgyNTY1OX0.nu5tpCjOoKMjfzt86FJR6f9Puqfuqunypu2vjfTfa_c');

async function run() {
  const { data, error } = await supabase.from('bills').insert([{
    citizen_id: 'a9e1ebd8-809f-43b5-9dbf-1c390cb3fa2e', // a proper uuid shape
    title: 'Municipal Bill - Property Tax',
    type: 'property_tax',
    amount: 100,
    status: 'unpaid',
    due_date: '2026-03-24'
  }]);
  console.log("DB Selection Response:");
  console.log("Error:", error);
  console.log("Data:", data);
}
run();
