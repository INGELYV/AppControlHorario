import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkProfiles() {
    try {
        const { data, error } = await supabase.from('profiles').select('*');
        if (error) {
            console.error('Error Profiles:', error);
            return;
        }
        console.log('Total profiles:', data.length);

        const { data: entries, error: entriesError } = await supabase.from('time_entries').select('*');
        if (entriesError) {
            console.error('Error Entries:', entriesError);
            return;
        }
        console.log('Total entries:', entries?.length);
    } catch (e) {
        console.error('Crash:', e);
    }
}

checkProfiles();
