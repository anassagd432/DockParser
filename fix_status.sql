-- FIX STATUS CONSTRAINT
-- Run this in Supabase SQL Editor

-- 1. Drop the old constraint (it might be outdated or case-sensitive)
ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_status_check;

-- 2. Add the correct constraint matching our App
ALTER TABLE invoices 
ADD CONSTRAINT invoices_status_check 
CHECK (status IN ('Review', 'Approved', 'Processing'));
