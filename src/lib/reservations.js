import { supabase } from './supabase.js';
import { BRANCH_SLUGS, MOCK_BRANCHES } from './branchSeeds.js';
import { todayLocalIso } from './date.js';
import { ryscanovkaTables } from '../components/TableMap/TableMapRyscanovka.jsx';

function getLocalTestReservations() {
  const ryscanovkaBranch = MOCK_BRANCHES.find((branch) => branch.slug === BRANCH_SLUGS.RYSCANOVKA);
  const testTable = ryscanovkaTables.find((table) => table.zone === 'gazebo' && table.number === '7');

  if (!ryscanovkaBranch || !testTable) {
    return [];
  }

  return [
    {
      id: 'local-test-ryscanovka-reservation',
      branch_id: ryscanovkaBranch.id,
      name: 'Test Riscani Guest',
      phone: '+373 (68) 000 001',
      email: 'test@example.com',
      date: todayLocalIso(),
      time: '18:30',
      guests_count: 4,
      status: 'confirmed',
      confirm_by_phone: true,
      notes: 'Local test booking for hostess dashboard.',
      table_id: testTable.id,
      table: testTable,
      reservation_tables: [{ table: testTable }],
      created_at: new Date().toISOString(),
    },
  ];
}

function normalizeReservation(reservation) {
  const linkedTables = reservation.reservation_tables
    ?.map((link) => link.table)
    .filter(Boolean) ?? [];
  const tables = linkedTables.length > 0
    ? linkedTables
    : reservation.table
      ? [reservation.table]
      : [];

  return {
    ...reservation,
    tables,
    table: tables[0] ?? reservation.table ?? null,
  };
}

export async function getReservations({ branchId, date, status, search }) {
  if (!supabase || !branchId) {
    return getLocalTestReservations()
      .filter((reservation) => reservation.branch_id === branchId)
      .filter((reservation) => !date || reservation.date === date)
      .filter((reservation) => !status || status === 'all' || reservation.status === status)
      .filter((reservation) => {
        if (!search) return true;
        const normalizedSearch = search.toLowerCase();
        return (
          reservation.name.toLowerCase().includes(normalizedSearch) ||
          reservation.phone.toLowerCase().includes(normalizedSearch)
        );
      })
      .map(normalizeReservation);
  }

  let query = supabase
    .from('reservations')
    .select('*, table:tables(id, number, capacity, zone), reservation_tables(table:tables(id, number, capacity, zone))')
    .eq('branch_id', branchId)
    .order('time', { ascending: true });

  if (date) {
    query = query.eq('date', date);
  }

  if (status && status !== 'all') {
    query = query.eq('status', status);
  }

  if (search) {
    query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%`);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data.map(normalizeReservation);
}

export async function getReservedTableIds({ branchId, date, time }) {
  if (!supabase || !branchId || !date || !time) {
    return [];
  }

  const { data, error } = await supabase.rpc('get_occupied_table_ids', {
    p_branch_id: branchId,
    p_date: date,
    p_time: time,
  });

  if (error) {
    throw error;
  }

  return data.map((row) => row.table_id);
}

export async function createReservation(payload, { tableIds } = {}) {
  const selectedTableIds = tableIds?.length
    ? tableIds
    : payload.table_ids?.length
      ? payload.table_ids
      : payload.table_id
        ? [payload.table_id]
        : [];

  if (!supabase) {
    return {
      id: crypto.randomUUID(),
      ...payload,
      tables: selectedTableIds.map((id) => ({ id })),
      status: payload.status ?? 'pending',
      created_at: new Date().toISOString(),
    };
  }

  const { data, error } = await supabase.rpc('create_public_reservation', {
    p_branch_id: payload.branch_id,
    p_name: payload.name,
    p_phone: payload.phone,
    p_email: payload.email,
    p_date: payload.date,
      p_time: payload.time,
      p_guests_count: payload.guests_count,
      p_table_ids: selectedTableIds,
      p_notes: payload.notes,
      p_confirm_by_phone: Boolean(payload.confirm_by_phone),
    });

  if (error) {
    throw error;
  }

  return {
    ...data,
    tables: selectedTableIds.map((id) => ({ id })),
  };
}

export async function updateReservation(id, payload, { tableIds } = {}) {
  const selectedTableIds = Array.isArray(tableIds)
    ? tableIds
    : payload.table_id
      ? [payload.table_id]
      : null;

  if (!supabase) {
    const localReservation = getLocalTestReservations().find((reservation) => reservation.id === id) ?? { id };
    return normalizeReservation({
      ...localReservation,
      ...payload,
      tables: localReservation.tables,
      reservation_tables: localReservation.reservation_tables,
    });
  }

  const { data, error } = await supabase
    .from('reservations')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  if (selectedTableIds !== null) {
    const { error: deleteError } = await supabase
      .from('reservation_tables')
      .delete()
      .eq('reservation_id', id);

    if (deleteError) {
      throw deleteError;
    }

    if (selectedTableIds.length > 0) {
      const { error: insertError } = await supabase
        .from('reservation_tables')
        .insert(selectedTableIds.map((tableId) => ({
          reservation_id: id,
          table_id: tableId,
        })));

      if (insertError) {
        throw insertError;
      }
    }
  }

  return normalizeReservation(data);
}
