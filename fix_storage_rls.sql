-- FIX STORAGE RLS POLICIES
-- Run this in Supabase SQL Editor

-- 1. Enable RLS (Commented out as it requires owner privileges and is usually already enabled)
-- ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 2. Drop potential conflicting policies for 'invoices' bucket
DROP POLICY IF EXISTS "Users can upload invoice files" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own invoice files" ON storage.objects;
DROP POLICY IF EXISTS "Give users access to own folder 1qkm9r_0" ON storage.objects;
DROP POLICY IF EXISTS "Give users access to own folder 1qkm9r_1" ON storage.objects;
DROP POLICY IF EXISTS "Give users access to own folder 1qkm9r_2" ON storage.objects;
DROP POLICY IF EXISTS "Give users access to own folder 1qkm9r_3" ON storage.objects;

-- 3. Create comprehensive policies for 'invoices' bucket
-- Allow SELECT for own files
CREATE POLICY "Invoices: Select Own"
ON storage.objects FOR SELECT
TO authenticated
USING ( bucket_id = 'invoices' AND auth.uid() = owner );

-- Allow INSERT for own files
CREATE POLICY "Invoices: Insert Own"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'invoices' AND auth.uid() = owner );

-- Allow UPDATE for own files
CREATE POLICY "Invoices: Update Own"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'invoices' AND auth.uid() = owner );

-- Allow DELETE for own files
CREATE POLICY "Invoices: Delete Own"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'invoices' AND auth.uid() = owner );
