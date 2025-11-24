-- Script to list all tables in the public schema
SELECT 
    table_name, 
    (SELECT count(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM 
    information_schema.tables t
WHERE 
    table_schema = 'public' 
    AND table_type = 'BASE TABLE'
ORDER BY 
    table_name;

-- If you want to see row counts (approximate), you can use this:
SELECT 
    relname AS table_name, 
    n_live_tup AS row_count 
FROM 
    pg_stat_user_tables 
ORDER BY 
    relname;
