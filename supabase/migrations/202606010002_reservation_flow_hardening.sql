update public.tables
set is_active = false
where branch_id = '22222222-2222-4222-8222-222222222222'
  and number in ('R1', 'R2', 'R3', 'R4', 'R5', 'F1');

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
  total_capacity int;
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

  if p_date is null or p_time is null then
    raise exception 'Reservation date and time are required';
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

  select count(*), coalesce(sum(t.capacity), 0)
  into valid_count, total_capacity
  from public.tables t
  where t.id = any(p_table_ids)
    and t.branch_id = p_branch_id
    and t.is_active = true;

  if valid_count <> selected_count then
    raise exception 'One or more selected tables are unavailable for this branch';
  end if;

  if total_capacity < p_guests_count then
    raise exception 'Selected tables do not have enough capacity';
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

revoke all on function public.create_public_reservation(uuid, text, text, text, date, time, int, uuid[], text) from public;
grant execute on function public.create_public_reservation(uuid, text, text, text, date, time, int, uuid[], text) to anon, authenticated;
