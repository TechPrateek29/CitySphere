import { createClient } from '@supabase/supabase-js';
const supabase = createClient('https://rpzyoeetqnjwssfapgsc.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwenlvZWV0cW5qd3NzZmFwZ3NjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyNDk2NTksImV4cCI6MjA4OTgyNTY1OX0.nu5tpCjOoKMjfzt86FJR6f9Puqfuqunypu2vjfTfa_c');

const typesToTest = [
  'penalty', 'fine', 'Fine', 'municipal_fine', 'municipal fine',
  'garbage', 'Garbage', 'waste', 'waste_management', 'sanitation', 'Sanitation', 'sewer', 'Sewer',
  'other', 'Other', 'fee', 'charge'
];

async function run() {
  console.log("Starting second brute force test...");
  for (const t of typesToTest) {
    const { data, error } = await supabase.from('bills').insert([{
      citizen_id: 'a9e1ebd8-809f-43b5-9dbf-1c390cb3fa2e',
      title: 'T',
      type: t,
      amount: 1,
      status: 'unpaid',
      due_date: '2026-03-24'
    }]);
    
    if (error && error.code === '23514') {
      // failed constraint
    } else if (error) {
       // if we hit foreign key (23503), it means it SURVIVED the check constraint
      console.log(`VALID TYPE: '${t}' (Error: ${error.message})`);
    } else {
      console.log(`SUCCESS! '${t}' is perfectly valid for 'bills.type'!!`);
    }
  }
}
run();
