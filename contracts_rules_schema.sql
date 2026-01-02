-- RUN IN SUPABASE SQL EDITOR

-- Update contracts table to store extracted intelligence
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS vendor_name TEXT;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS extracted_rules JSONB;
