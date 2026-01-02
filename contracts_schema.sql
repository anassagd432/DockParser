-- Contracts Table & Storage
-- Run in Supabase SQL Editor

-- 1. Create Contracts Table
create table if not exists contracts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  filename text,
  file_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Enable RLS
alter table contracts enable row level security;

-- 3. Policies
create policy "Users can view their own contracts"
  on contracts for select
  using ( auth.uid() = user_id );

create policy "Users can insert their own contracts"
  on contracts for insert
  with check ( auth.uid() = user_id );

create policy "Users can delete their own contracts"
  on contracts for delete
  using ( auth.uid() = user_id );

-- 4. Storage Bucket
insert into storage.buckets (id, name, public) 
values ('contracts', 'contracts', false)
on conflict (id) do nothing;

create policy "Users can upload contract files"
  on storage.objects for insert
  with check ( bucket_id = 'contracts' and auth.uid() = owner );

create policy "Users can view their own contract files"
  on storage.objects for select
  using ( bucket_id = 'contracts' and auth.uid() = owner );
