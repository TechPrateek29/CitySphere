import { createClient } from '@supabase/supabase-js';
const supabase = createClient('https://rpzyoeetqnjwssfapgsc.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwenlvZWV0cW5qd3NzZmFwZ3NjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyNDk2NTksImV4cCI6MjA4OTgyNTY1OX0.nu5tpCjOoKMjfzt86FJR6f9Puqfuqunypu2vjfTfa_c');

const typesToTest = [
  'property_tax', 'water', 'electricity', 'garbage', 'fine', 'other',
  'Property Tax', 'Water', 'Electricity', 'Garbage', 'Fine', 'Other',
  'property tax', 'PROPERTY TAX', 'PROPERTY_TAX', 'Tax', 'tax',
  'Sanitation', 'sanitation', 'utility', 'Utility',
  'property', 'water_supply', 'municipal_fine'
];

async function run() {
  console.log("Starting brute force test for bills type check...");
  for (const t of typesToTest) {
    const { data, error } = await supabase.from('bills').insert([{
      citizen_id: 'a9e1ebd8-809f-43b5-9dbf-1c390cb3fa2e',
      title: `Test - ${t}`,
      type: t,
      amount: 100,
      status: 'unpaid',
      due_date: '2026-03-24'
    }]);
    
    if (error && error.code === '23514' && error.message.includes('bills_type_check')) {
      // failed constraint
    } else if (error) {
      console.log(`Failed for '${t}', BUT DIFFERENT ERROR:`, error.message);
    } else {
      console.log(`SUCCESS! '${t}' is perfectly valid for 'bills.type'!!`);
    }
  }
}
run();
