-- Create a table for storing invoices
create table invoices (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  file_url text,
  vendor text,
  date date,
  total numeric,
  status text check (status in ('Review', 'Approved', 'Processing')),
  confidence numeric,
  extracted_data jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table invoices enable row level security;

-- Create policies
create policy "Users can view their own invoices"
  on invoices for select
  using ( auth.uid() = user_id );

create policy "Users can insert their own invoices"
  on invoices for insert
  with check ( auth.uid() = user_id );

-- Create storage bucket for invoice files
insert into storage.buckets (id, name, public) 
values ('invoices', 'invoices', false);

create policy "Users can upload invoice files"
  on storage.objects for insert
  with check ( bucket_id = 'invoices' and auth.uid() = owner );

create policy "Users can view their own invoice files"
  using ( bucket_id = 'invoices' and auth.uid() = owner );

-- Contracts Table & Storage

-- 1. Create Contracts Table
create table if not exists contracts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  filename text,
  file_url text,
  vendor_name text,
  extracted_rules jsonb,
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
