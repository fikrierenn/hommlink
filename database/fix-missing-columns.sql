-- Fix missing columns in leads table
-- Add missing columns if they don't exist

-- Check if call_count column exists, if not add it
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'leads' 
        AND column_name = 'call_count'
    ) THEN
        ALTER TABLE public.leads ADD COLUMN call_count int DEFAULT 0;
        RAISE NOTICE 'Added call_count column to leads table';
    ELSE
        RAISE NOTICE 'call_count column already exists';
    END IF;
END $$;

-- Check if last_contact_at column exists, if not add it
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'leads' 
        AND column_name = 'last_contact_at'
    ) THEN
        ALTER TABLE public.leads ADD COLUMN last_contact_at timestamptz;
        RAISE NOTICE 'Added last_contact_at column to leads table';
    ELSE
        RAISE NOTICE 'last_contact_at column already exists';
    END IF;
END $$;

-- Check if appointment_date column exists, if not add it
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'leads' 
        AND column_name = 'appointment_date'
    ) THEN
        ALTER TABLE public.leads ADD COLUMN appointment_date timestamptz;
        RAISE NOTICE 'Added appointment_date column to leads table';
    ELSE
        RAISE NOTICE 'appointment_date column already exists';
    END IF;
END $$;

-- Show current leads table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'leads'
ORDER BY ordinal_position;