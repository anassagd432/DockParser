-- RUN THIS IN SUPABASE SQL EDITOR

-- 1. Ensure new columns exist (idempotent)
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS invoice_date DATE;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS total_amount NUMERIC;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD';

-- 2. Optional: Migrate old data if you have any (mapped from old columns)
-- UPDATE invoices SET invoice_date = date WHERE invoice_date IS NULL;
-- UPDATE invoices SET total_amount = total WHERE total_amount IS NULL;
