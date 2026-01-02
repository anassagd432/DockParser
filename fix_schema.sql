-- Run this in your Supabase SQL Editor to fix the missing column

ALTER TABLE invoices 
ADD COLUMN IF NOT EXISTS confidence FLOAT;

-- To be safe, let's make sure other columns exist too
ALTER TABLE invoices 
ADD COLUMN IF NOT EXISTS vendor TEXT,
ADD COLUMN IF NOT EXISTS total NUMERIC,
ADD COLUMN IF NOT EXISTS status TEXT,
ADD COLUMN IF NOT EXISTS date DATE;
