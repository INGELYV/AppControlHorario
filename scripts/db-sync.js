import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Note: Values are loaded via Node --env-file flag
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
    console.error('Error: Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function runMigrations() {
    const migrationsDir = path.resolve('supabase/migrations');

    if (!fs.existsSync(migrationsDir)) {
        console.error('Migrations directory not found');
        return;
    }

    const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();

    console.log(`Found ${files.length} migration files.`);

    for (const file of files) {
        console.log(`Applying migration: ${file}...`);
        const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');

        // Attempting direct execution via RPC. 
        // In Supabase, you can create a function called 'exec_sql' to allow this.
        const { error } = await supabase.rpc('exec_sql', { sql_query: sql });

        if (error) {
            if (error.message.includes('function "exec_sql" does not exist')) {
                console.log('--- ACTION REQUIRED ---');
                console.log('The "exec_sql" function is missing in your Supabase project.');
                console.log('Please copy the следующая SQL into your Supabase SQL Editor once:');
                console.log(`
CREATE OR REPLACE FUNCTION exec_sql(sql_query TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql_query;
END;
$$;
           `);
            } else {
                console.error(`Error applying ${file}:`, error.message);
            }
        } else {
            console.log(`Successfully applied ${file}`);
        }
    }
}

runMigrations();
