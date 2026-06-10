create table if not exists public.reservation_tables (
  reservation_id uuid not null references public.reservations(id) on delete cascade,
  table_id uuid not null references public.tables(id) on delete restrict,
  branch_id uuid not null references public.branches(id) on delete cascade,
  date date not null,
  time time not null,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'seated', 'cancelled')),
  created_at timestamptz default now(),
  primary key (reservation_id, table_id)
);

alter table public.tables drop constraint if exists tables_branch_id_number_key;

create unique index if not exists idx_tables_branch_zone_number
  on public.tables(branch_id, zone, number);

insert into public.tables (id, branch_id, number, capacity, zone, x, y, is_active)
values
  ('22222222-2222-4222-8222-000000000101', '22222222-2222-4222-8222-222222222222', '1', 6, 'gazebo', 11, 76, true),
  ('22222222-2222-4222-8222-000000000102', '22222222-2222-4222-8222-222222222222', '2', 6, 'gazebo', 10, 56, true),
  ('22222222-2222-4222-8222-000000000103', '22222222-2222-4222-8222-222222222222', '3', 4, 'gazebo', 14, 25, true),
  ('22222222-2222-4222-8222-000000000104', '22222222-2222-4222-8222-222222222222', '4', 4, 'gazebo', 9, 25, true),
  ('22222222-2222-4222-8222-000000000105', '22222222-2222-4222-8222-222222222222', '5', 4, 'gazebo', 9, 13, true),
  ('22222222-2222-4222-8222-000000000106', '22222222-2222-4222-8222-222222222222', '6', 4, 'gazebo', 14, 13, true),
  ('22222222-2222-4222-8222-000000000107', '22222222-2222-4222-8222-222222222222', '7', 8, 'gazebo', 26, 16, true),
  ('22222222-2222-4222-8222-000000000108', '22222222-2222-4222-8222-222222222222', '8', 4, 'gazebo', 52, 25, true),
  ('22222222-2222-4222-8222-000000000109', '22222222-2222-4222-8222-222222222222', '9', 4, 'gazebo', 52, 13, true),
  ('22222222-2222-4222-8222-000000000110', '22222222-2222-4222-8222-222222222222', '10', 4, 'gazebo', 62, 13, true),
  ('22222222-2222-4222-8222-000000000111', '22222222-2222-4222-8222-222222222222', '11', 4, 'gazebo', 62, 25, true),
  ('22222222-2222-4222-8222-000000000112', '22222222-2222-4222-8222-222222222222', '12', 4, 'gazebo', 78, 25, true),
  ('22222222-2222-4222-8222-000000000113', '22222222-2222-4222-8222-222222222222', '13', 4, 'gazebo', 78, 13, true),
  ('22222222-2222-4222-8222-000000000114', '22222222-2222-4222-8222-222222222222', '14', 4, 'gazebo', 89, 13, true),
  ('22222222-2222-4222-8222-000000000115', '22222222-2222-4222-8222-222222222222', '15', 4, 'gazebo', 89, 25, true),
  ('22222222-2222-4222-8222-000000000116', '22222222-2222-4222-8222-222222222222', '16', 8, 'gazebo', 84, 45, true),
  ('22222222-2222-4222-8222-000000000117', '22222222-2222-4222-8222-222222222222', '17', 8, 'gazebo', 84, 58, true),
  ('22222222-2222-4222-8222-000000000118', '22222222-2222-4222-8222-222222222222', '18', 8, 'gazebo', 84, 72, true),
  ('22222222-2222-4222-8222-000000000119', '22222222-2222-4222-8222-222222222222', '19', 6, 'gazebo', 28, 39, true),
  ('22222222-2222-4222-8222-000000000201', '22222222-2222-4222-8222-222222222222', '1', 4, 'hookah', 20, 34, true),
  ('22222222-2222-4222-8222-000000000202', '22222222-2222-4222-8222-222222222222', '2', 8, 'hookah', 52, 29, true),
  ('22222222-2222-4222-8222-000000000203', '22222222-2222-4222-8222-222222222222', '3', 4, 'hookah', 79, 40, true),
  ('22222222-2222-4222-8222-000000000204', '22222222-2222-4222-8222-222222222222', '4', 8, 'hookah', 79, 62, true),
  ('22222222-2222-4222-8222-000000000320', '22222222-2222-4222-8222-222222222222', '20', 4, 'veranda', 10, 20, true),
  ('22222222-2222-4222-8222-000000000321', '22222222-2222-4222-8222-222222222222', '21', 4, 'veranda', 20, 20, true),
  ('22222222-2222-4222-8222-000000000322', '22222222-2222-4222-8222-222222222222', '22', 4, 'veranda', 30, 20, true),
  ('22222222-2222-4222-8222-000000000323', '22222222-2222-4222-8222-222222222222', '23', 4, 'veranda', 48, 20, true),
  ('22222222-2222-4222-8222-000000000324', '22222222-2222-4222-8222-222222222222', '24', 4, 'veranda', 58, 20, true),
  ('22222222-2222-4222-8222-000000000325', '22222222-2222-4222-8222-222222222222', '25', 4, 'veranda', 68, 20, true),
  ('22222222-2222-4222-8222-000000000326', '22222222-2222-4222-8222-222222222222', '26', 4, 'veranda', 78, 20, true),
  ('22222222-2222-4222-8222-000000000327', '22222222-2222-4222-8222-222222222222', '27', 4, 'veranda', 88, 20, true),
  ('22222222-2222-4222-8222-000000000328', '22222222-2222-4222-8222-222222222222', '28', 4, 'veranda', 88, 75, true),
  ('22222222-2222-4222-8222-000000000329', '22222222-2222-4222-8222-222222222222', '29', 4, 'veranda', 78, 75, true),
  ('22222222-2222-4222-8222-000000000330', '22222222-2222-4222-8222-222222222222', '30', 4, 'veranda', 68, 75, true),
  ('22222222-2222-4222-8222-000000000331', '22222222-2222-4222-8222-222222222222', '31', 4, 'veranda', 58, 75, true),
  ('22222222-2222-4222-8222-000000000332', '22222222-2222-4222-8222-222222222222', '32', 4, 'veranda', 10, 75, true),
  ('22222222-2222-4222-8222-000000000007', '22222222-2222-4222-8222-222222222222', 'VIP', 10, 'hall', 21, 24, true),
  ('22222222-2222-4222-8222-000000000440', '22222222-2222-4222-8222-222222222222', '40', 4, 'hall', 70, 21, true),
  ('22222222-2222-4222-8222-000000000441', '22222222-2222-4222-8222-222222222222', '41', 4, 'hall', 70, 34, true),
  ('22222222-2222-4222-8222-000000000442', '22222222-2222-4222-8222-222222222222', '42', 4, 'hall', 70, 47, true),
  ('22222222-2222-4222-8222-000000000450', '22222222-2222-4222-8222-222222222222', '50', 4, 'hall', 38, 52, true),
  ('22222222-2222-4222-8222-000000000451', '22222222-2222-4222-8222-222222222222', '51', 4, 'hall', 38, 64, true),
  ('22222222-2222-4222-8222-000000000452', '22222222-2222-4222-8222-222222222222', '52', 4, 'hall', 38, 76, true),
  ('22222222-2222-4222-8222-000000000453', '22222222-2222-4222-8222-222222222222', '53', 4, 'hall', 38, 88, true),
  ('22222222-2222-4222-8222-000000000454', '22222222-2222-4222-8222-222222222222', '54', 4, 'hall', 38, 96, true),
  ('22222222-2222-4222-8222-000000000460', '22222222-2222-4222-8222-222222222222', '60', 4, 'hall', 62, 12, true),
  ('22222222-2222-4222-8222-000000000461', '22222222-2222-4222-8222-222222222222', '61', 4, 'hall', 62, 28, true),
  ('22222222-2222-4222-8222-000000000470', '22222222-2222-4222-8222-222222222222', '70', 4, 'hall', 48, 12, true),
  ('22222222-2222-4222-8222-000000000471', '22222222-2222-4222-8222-222222222222', '71', 4, 'hall', 48, 28, true),
  ('22222222-2222-4222-8222-000000000480', '22222222-2222-4222-8222-222222222222', '80', 8, 'hall', 64, 88, true)
on conflict (id) do update
set capacity = excluded.capacity,
    number = excluded.number,
    branch_id = excluded.branch_id,
    zone = excluded.zone,
    x = excluded.x,
    y = excluded.y,
    is_active = excluded.is_active;

insert into public.reservation_tables (reservation_id, table_id, branch_id, date, time, status)
select r.id, r.table_id, r.branch_id, r.date, r.time, coalesce(r.status, 'pending')
from public.reservations r
where r.table_id is not null
on conflict (reservation_id, table_id) do update
set branch_id = excluded.branch_id,
    date = excluded.date,
    time = excluded.time,
    status = excluded.status;

create or replace function public.sync_reservation_table_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  source_reservation public.reservations;
  source_table public.tables;
begin
  select *
  into source_reservation
  from public.reservations
  where id = new.reservation_id;

  if not found then
    raise exception 'Reservation % does not exist', new.reservation_id;
  end if;

  select *
  into source_table
  from public.tables
  where id = new.table_id;

  if not found then
    raise exception 'Table % does not exist', new.table_id;
  end if;

  if source_table.branch_id <> source_reservation.branch_id then
    raise exception 'Table % does not belong to reservation branch', new.table_id;
  end if;

  if source_table.is_active is not true then
    raise exception 'Table % is inactive', new.table_id;
  end if;

  new.branch_id := source_reservation.branch_id;
  new.date := source_reservation.date;
  new.time := source_reservation.time;
  new.status := source_reservation.status;

  return new;
end;
$$;

drop trigger if exists trg_reservation_tables_sync_fields on public.reservation_tables;
create trigger trg_reservation_tables_sync_fields
  before insert or update of reservation_id, table_id
  on public.reservation_tables
  for each row
  execute function public.sync_reservation_table_fields();

create or replace function public.sync_reservation_links_from_reservation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.reservation_tables
  set branch_id = new.branch_id,
      date = new.date,
      time = new.time,
      status = new.status
  where reservation_id = new.id;

  return new;
end;
$$;

drop trigger if exists trg_reservations_sync_table_links on public.reservations;
create trigger trg_reservations_sync_table_links
  after update of branch_id, date, time, status
  on public.reservations
  for each row
  execute function public.sync_reservation_links_from_reservation();

create unique index if not exists idx_reservation_tables_no_double_booking
  on public.reservation_tables(branch_id, table_id, date, time)
  where status in ('pending', 'confirmed', 'seated');

create index if not exists idx_reservation_tables_reservation_id
  on public.reservation_tables(reservation_id);

create index if not exists idx_reservation_tables_branch_date_time
  on public.reservation_tables(branch_id, date, time);

alter table public.reservation_tables enable row level security;

drop policy if exists "Guests can create reservations" on public.reservations;

create policy "Staff can insert assigned branch reservations"
  on public.reservations for insert
  with check (
    exists (
      select 1
      from public.staff_branches sb
      where sb.user_id = auth.uid()
        and sb.branch_id = reservations.branch_id
    )
  );

create policy "Staff can read assigned branch reservation tables"
  on public.reservation_tables for select
  using (
    exists (
      select 1
      from public.staff_branches sb
      where sb.user_id = auth.uid()
        and sb.branch_id = reservation_tables.branch_id
    )
  );

create policy "Staff can insert assigned branch reservation tables"
  on public.reservation_tables for insert
  with check (
    exists (
      select 1
      from public.staff_branches sb
      where sb.user_id = auth.uid()
        and sb.branch_id = reservation_tables.branch_id
    )
  );

create policy "Staff can update assigned branch reservation tables"
  on public.reservation_tables for update
  using (
    exists (
      select 1
      from public.staff_branches sb
      where sb.user_id = auth.uid()
        and sb.branch_id = reservation_tables.branch_id
    )
  )
  with check (
    exists (
      select 1
      from public.staff_branches sb
      where sb.user_id = auth.uid()
        and sb.branch_id = reservation_tables.branch_id
    )
  );

create policy "Staff can delete assigned branch reservation tables"
  on public.reservation_tables for delete
  using (
    exists (
      select 1
      from public.staff_branches sb
      where sb.user_id = auth.uid()
        and sb.branch_id = reservation_tables.branch_id
    )
  );

create or replace function public.get_occupied_table_ids(
  p_branch_id uuid,
  p_date date,
  p_time time
)
returns table(table_id uuid)
language sql
stable
security definer
set search_path = public
as $$
  select distinct rt.table_id
  from public.reservation_tables rt
  join public.tables t on t.id = rt.table_id
  where rt.branch_id = p_branch_id
    and rt.date = p_date
    and rt.time = p_time
    and rt.status in ('pending', 'confirmed', 'seated')
    and t.is_active = true;
$$;

create or replace function public.create_public_reservation(
  p_branch_id uuid,
  p_name text,
  p_phone text,
  p_email text,
  p_date date,
  p_time time,
  p_guests_count int,
  p_table_ids uuid[],
  p_notes text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  selected_count int;
  valid_count int;
  new_reservation public.reservations;
begin
  if p_branch_id is null then
    raise exception 'Branch is required';
  end if;

  if nullif(trim(p_name), '') is null then
    raise exception 'Guest name is required';
  end if;

  if nullif(trim(p_phone), '') is null then
    raise exception 'Guest phone is required';
  end if;

  if p_guests_count is null or p_guests_count < 1 or p_guests_count > 12 then
    raise exception 'Guests count must be between 1 and 12';
  end if;

  selected_count := coalesce(cardinality(p_table_ids), 0);

  if selected_count < 1 then
    raise exception 'At least one table is required';
  end if;

  select count(distinct table_id)
  into valid_count
  from unnest(p_table_ids) as selected(table_id);

  if valid_count <> selected_count then
    raise exception 'Selected tables must be unique';
  end if;

  select count(*)
  into valid_count
  from public.tables t
  where t.id = any(p_table_ids)
    and t.branch_id = p_branch_id
    and t.is_active = true;

  if valid_count <> selected_count then
    raise exception 'One or more selected tables are unavailable for this branch';
  end if;

  insert into public.reservations (
    branch_id,
    name,
    phone,
    email,
    date,
    time,
    guests_count,
    table_id,
    status,
    notes
  )
  values (
    p_branch_id,
    trim(p_name),
    trim(p_phone),
    nullif(trim(p_email), ''),
    p_date,
    p_time,
    p_guests_count,
    p_table_ids[1],
    'pending',
    nullif(trim(p_notes), '')
  )
  returning *
  into new_reservation;

  insert into public.reservation_tables (reservation_id, table_id)
  select new_reservation.id, selected.table_id
  from unnest(p_table_ids) with ordinality as selected(table_id, position)
  order by selected.position;

  return to_jsonb(new_reservation);
exception
  when unique_violation then
    raise exception 'One or more selected tables are already occupied for this date and time';
end;
$$;

revoke all on function public.get_occupied_table_ids(uuid, date, time) from public;
revoke all on function public.create_public_reservation(uuid, text, text, text, date, time, int, uuid[], text) from public;

grant execute on function public.get_occupied_table_ids(uuid, date, time) to anon, authenticated;
grant execute on function public.create_public_reservation(uuid, text, text, text, date, time, int, uuid[], text) to anon, authenticated;
