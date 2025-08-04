-- Check all databases in your Supabase project
SELECT datname FROM pg_database WHERE datistemplate = false;

-- Check current database
SELECT current_database();

-- Check if we're connected to the right database
SELECT current_database() as current_db, 
       (SELECT datname FROM pg_database WHERE datname = 'taskapi') as taskapi_exists; 