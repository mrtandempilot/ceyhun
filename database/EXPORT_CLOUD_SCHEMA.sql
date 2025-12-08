-- ============================================
-- EXPORT CLOUD SCHEMA - Run on Supabase Cloud
-- ============================================
-- This generates the exact SQL to recreate your Cloud schema on VPS

-- Generate ALTER TABLE statements for all columns
SELECT 
    'ALTER TABLE public.bookings ALTER COLUMN ' || 
    column_name || 
    ' TYPE ' ||
    CASE 
        WHEN data_type = 'character varying' THEN 'varchar(' || character_maximum_length || ')'
        WHEN data_type = 'numeric' AND numeric_precision IS NOT NULL 
            THEN 'numeric(' || numeric_precision || ',' || COALESCE(numeric_scale, 0) || ')'
        WHEN data_type = 'timestamp with time zone' THEN 'timestamptz'
        WHEN data_type = 'timestamp without time zone' THEN 'timestamp'
        ELSE data_type
    END || 
    CASE 
        WHEN is_nullable = 'NO' THEN ' NOT NULL'
        ELSE ''
    END || ';' as alter_statement
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'bookings'
ORDER BY ordinal_position;

-- Copy the output and run it on your VPS server
