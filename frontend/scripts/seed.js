import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Client (Fill these in with your project details)
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';
const supabase = createClient(supabaseUrl, supabaseKey);

const seedDatabase = async () => {
    console.log('🌱 Starting database seeding...');
    
    // Seed 20 random complaints for Public Dashboard metrics
    const statuses = ['pending', 'in-progress', 'resolved', 'resolved', 'resolved'];
    const depts = ['General', 'Water', 'Electricity', 'Roads', 'Sanitation'];
    
    const complaints = Array.from({ length: 20 }).map((_, i) => ({
        title: `Public Issue #${i + 1}`,
        description: `This is an auto-generated sample issue description for testing area ${i}.`,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        department: depts[Math.floor(Math.random() * depts.length)],
        rating: Math.floor(Math.random() * 5) + 1, // Random rating between 1-5
        citizen_id: 'dummy-uuid-to-replace' // Note: Make sure to replace with a real citizen ID, or disable foreign key constraints for seeding.
    }));

    console.log('Normally, we execute an insert query here:');
    console.log('await supabase.from("complaints").insert(complaints)');
    console.log('✅ Seeding script complete. Please ensure foreign keys constraints are respected when running against a live DB.');
};

seedDatabase();
