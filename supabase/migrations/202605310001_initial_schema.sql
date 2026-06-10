create extension if not exists pgcrypto;

create table if not exists public.branches (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text not null,
  phone text,
  email text,
  working_hours jsonb
);

alter table public.branches add column if not exists email text;

create table if not exists public.tables (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid references public.branches(id) on delete cascade not null,
  number text not null,
  capacity int not null check (capacity > 0),
  zone text,
  x int,
  y int,
  is_active boolean default true,
  unique (branch_id, number)
);

create table if not exists public.reservations (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid references public.branches(id) on delete cascade not null,
  name text not null,
  phone text not null,
  email text,
  date date not null,
  time time not null,
  guests_count int not null check (guests_count between 1 and 12),
  table_id uuid references public.tables(id) on delete set null,
  status text default 'pending' check (status in ('pending', 'confirmed', 'seated', 'cancelled')),
  notes text,
  created_at timestamptz default now()
);

create table if not exists public.staff_branches (
  user_id uuid references auth.users(id) on delete cascade,
  branch_id uuid references public.branches(id) on delete cascade,
  primary key (user_id, branch_id)
);

create index if not exists idx_tables_branch_id on public.tables(branch_id);
create index if not exists idx_reservations_branch_date_time on public.reservations(branch_id, date, time);
create index if not exists idx_reservations_branch_status on public.reservations(branch_id, status);

alter table public.branches enable row level security;
alter table public.tables enable row level security;
alter table public.reservations enable row level security;
alter table public.staff_branches enable row level security;

create policy "Branches are readable by everyone"
  on public.branches for select
  using (true);

create policy "Active tables are readable by everyone"
  on public.tables for select
  using (is_active = true);

create policy "Guests can create reservations"
  on public.reservations for insert
  with check (true);

create policy "Staff can read assigned branch reservations"
  on public.reservations for select
  using (
    exists (
      select 1
      from public.staff_branches sb
      where sb.user_id = auth.uid()
        and sb.branch_id = reservations.branch_id
    )
  );

create policy "Staff can update assigned branch reservations"
  on public.reservations for update
  using (
    exists (
      select 1
      from public.staff_branches sb
      where sb.user_id = auth.uid()
        and sb.branch_id = reservations.branch_id
    )
  )
  with check (
    exists (
      select 1
      from public.staff_branches sb
      where sb.user_id = auth.uid()
        and sb.branch_id = reservations.branch_id
    )
  );

create policy "Staff can read own branch links"
  on public.staff_branches for select
  using (user_id = auth.uid());

insert into public.branches (id, name, address, phone, email, working_hours)
values
  (
    '11111111-1111-4111-8111-111111111111',
    'Центр',
    'str. Columna 104, Chisinau',
    '+373 (68) 995 559',
    'tiflis.md@gmail.com',
    '{"mon":"11:00-23:00","tue":"11:00-23:00","wed":"11:00-23:00","thu":"11:00-23:00","fri":"11:00-23:00","sat":"11:00-23:00","sun":"11:00-23:00"}'::jsonb
  ),
  (
    '22222222-2222-4222-8222-222222222222',
    'Рышкановка',
    'Strada Studenților 1/6, Chișinău',
    '+373 (68) 575 557',
    'tiflis.md@gmail.com',
    '{"mon":"11:00-23:00","tue":"11:00-23:00","wed":"11:00-23:00","thu":"11:00-23:00","fri":"11:00-23:00","sat":"11:00-23:00","sun":"11:00-23:00"}'::jsonb
  )
on conflict (id) do update
set name = excluded.name,
    address = excluded.address,
    phone = excluded.phone,
    email = excluded.email,
    working_hours = excluded.working_hours;

insert into public.tables (id, branch_id, number, capacity, zone, x, y)
values
  ('11111111-1111-4111-8111-000000000001', '11111111-1111-4111-8111-111111111111', 'C1', 2, 'main', 14, 22),
  ('11111111-1111-4111-8111-000000000002', '11111111-1111-4111-8111-111111111111', 'C2', 2, 'main', 32, 22),
  ('11111111-1111-4111-8111-000000000003', '11111111-1111-4111-8111-111111111111', 'C3', 4, 'main', 52, 24),
  ('11111111-1111-4111-8111-000000000004', '11111111-1111-4111-8111-111111111111', 'C4', 4, 'main', 72, 24),
  ('11111111-1111-4111-8111-000000000005', '11111111-1111-4111-8111-111111111111', 'C5', 6, 'main', 22, 52),
  ('11111111-1111-4111-8111-000000000006', '11111111-1111-4111-8111-111111111111', 'C6', 6, 'main', 48, 54),
  ('11111111-1111-4111-8111-000000000007', '11111111-1111-4111-8111-111111111111', 'T1', 2, 'terrace', 76, 56),
  ('11111111-1111-4111-8111-000000000008', '11111111-1111-4111-8111-111111111111', 'T2', 4, 'terrace', 86, 76),
  ('11111111-1111-4111-8111-000000000009', '11111111-1111-4111-8111-111111111111', 'VIP', 8, 'vip', 22, 80),
  ('22222222-2222-4222-8222-000000000001', '22222222-2222-4222-8222-222222222222', 'R1', 2, 'main', 18, 24),
  ('22222222-2222-4222-8222-000000000002', '22222222-2222-4222-8222-222222222222', 'R2', 4, 'main', 42, 24),
  ('22222222-2222-4222-8222-000000000003', '22222222-2222-4222-8222-222222222222', 'R3', 4, 'main', 66, 24),
  ('22222222-2222-4222-8222-000000000004', '22222222-2222-4222-8222-222222222222', 'R4', 6, 'main', 30, 56),
  ('22222222-2222-4222-8222-000000000005', '22222222-2222-4222-8222-222222222222', 'R5', 4, 'main', 58, 56),
  ('22222222-2222-4222-8222-000000000006', '22222222-2222-4222-8222-222222222222', 'F1', 6, 'terrace', 82, 52),
  ('22222222-2222-4222-8222-000000000007', '22222222-2222-4222-8222-222222222222', 'VIP', 10, 'vip', 24, 82)
on conflict (branch_id, number) do update
set capacity = excluded.capacity,
    zone = excluded.zone,
    x = excluded.x,
    y = excluded.y,
    is_active = true;
