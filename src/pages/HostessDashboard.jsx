import { useMemo, useState } from 'react';
import { AlertCircle, CalendarDays, Map, Plus, Search } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import AddReservationModal from '../components/AddReservationModal.jsx';
import BranchSwitcher from '../components/BranchSwitcher.jsx';
import EditReservationModal from '../components/EditReservationModal.jsx';
import HostessMapModal from '../components/HostessMapModal.jsx';
import ReservationList from '../components/ReservationList.jsx';
import { useBranch } from '../hooks/useBranch.js';
import { useReservations } from '../hooks/useReservations.js';
import { todayLocalIso } from '../lib/date.js';
import { hasHostessAccess } from '../lib/hostessAccess.js';
import { updateReservation } from '../lib/reservations.js';

export default function HostessDashboard() {
  const { currentBranch } = useBranch();
  const [date, setDate] = useState(todayLocalIso());
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [editingReservation, setEditingReservation] = useState(null);
  const [actionError, setActionError] = useState('');
  const [statusOverrides, setStatusOverrides] = useState({});
  const { reservations, isLoading, error, refetch } = useReservations({
    branchId: currentBranch?.id,
    date,
    status,
    search,
  });
  const {
    reservations: mapReservations,
    isLoading: isMapLoading,
    error: mapError,
    refetch: refetchMapReservations,
  } = useReservations({
    branchId: currentBranch?.id,
    date,
    status: 'all',
    search: '',
  });

  const visibleReservations = useMemo(
    () => reservations.map((reservation) => ({
      ...reservation,
      status: statusOverrides[reservation.id] ?? reservation.status,
    })),
    [reservations, statusOverrides],
  );

  const stats = useMemo(
    () => ({
      total: visibleReservations.length,
      confirmed: visibleReservations.filter((item) => item.status === 'confirmed').length,
      seated: visibleReservations.filter((item) => item.status === 'seated').length,
      pending: visibleReservations.filter((item) => item.status === 'pending').length,
    }),
    [visibleReservations],
  );

  const refreshReservations = async () => {
    await Promise.all([
      refetch().catch(() => null),
      refetchMapReservations().catch(() => null),
    ]);
  };

  const handleStatusChange = async (reservation, nextStatus) => {
    setActionError('');
    setStatusOverrides((current) => ({ ...current, [reservation.id]: nextStatus }));

    try {
      await updateReservation(reservation.id, { status: nextStatus });
      await refreshReservations();
      setStatusOverrides((current) => {
        const next = { ...current };
        delete next[reservation.id];
        return next;
      });
    } catch (statusError) {
      setStatusOverrides((current) => {
        const next = { ...current };
        delete next[reservation.id];
        return next;
      });
      setActionError(statusError.message);
    }
  };

  const handleMarkArrived = (reservation) => handleStatusChange(reservation, 'seated');

  if (!hasHostessAccess()) {
    return <Navigate to="/hostess" replace />;
  }

  if (!currentBranch) {
    return <Navigate to="/hostess/branches" replace />;
  }

  return (
    <main className="hostess-dashboard-screen min-h-screen bg-[#F4F1E7] px-4 py-4 text-ink sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-5 flex flex-col gap-4 border-b border-ink/10 pb-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-wine">TIFLIS · дашборд хостес</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight">{currentBranch.name}</h1>
            <p className="mt-1 text-sm text-ink/60">Брони выбранного филиала на выбранную дату</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <BranchSwitcher />
            <button
              type="button"
              className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-ink/15 bg-cream px-4 py-2.5 text-sm font-semibold text-ink shadow-sm transition hover:border-wine/35 hover:bg-linen focus:outline-none focus:ring-2 focus:ring-wine focus:ring-offset-2 focus:ring-offset-linen"
              onClick={() => setIsMapOpen(true)}
            >
              <Map className="h-4 w-4" aria-hidden="true" />
              Открыть карту
            </button>
            <button
              type="button"
              className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-ink px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-coffee focus:outline-none focus:ring-2 focus:ring-wine focus:ring-offset-2 focus:ring-offset-linen"
              onClick={() => setIsAddOpen(true)}
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Добавить бронь
            </button>
          </div>
        </header>

        <section className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Всего" value={stats.total} tone="total" />
          <Stat label="Подтверждено" value={stats.confirmed} tone="confirmed" />
          <Stat label="За столом" value={stats.seated} tone="seated" />
          <Stat label="Ожидают" value={stats.pending} tone="pending" />
        </section>

        <section className="mb-5 grid gap-3 rounded-xl bg-cream p-3 shadow-sm ring-1 ring-ink/10 md:grid-cols-[190px_190px_1fr]">
          <label className="hostess-field">
            <span className="hostess-field-label">Дата</span>
            <span className="hostess-field-control">
              <CalendarDays className="h-4 w-4 text-ink/45" aria-hidden="true" />
              <input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="min-w-0 flex-1 bg-transparent outline-none" />
            </span>
          </label>
          <label className="hostess-field">
            <span className="hostess-field-label">Статус</span>
            <select value={status} onChange={(event) => setStatus(event.target.value)} className="hostess-select">
              <option value="all">Все статусы</option>
              <option value="pending">Ожидают</option>
              <option value="confirmed">Подтверждены</option>
              <option value="seated">За столом</option>
              <option value="cancelled">Отменены</option>
            </select>
          </label>
          <label className="hostess-field">
            <span className="hostess-field-label">Поиск</span>
            <span className="hostess-field-control">
              <Search className="h-4 w-4 text-ink/45" aria-hidden="true" />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Имя или телефон" className="min-w-0 flex-1 bg-transparent outline-none" />
            </span>
          </label>
        </section>

        {error || actionError ? (
          <div className="mb-4 flex items-start gap-3 rounded-xl border border-wine/25 bg-wine/10 p-4 text-sm text-wine">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
            <div>
              <p className="font-semibold">Не удалось загрузить бронирования</p>
              <p className="mt-1 text-wine/80">{error ?? actionError}</p>
            </div>
          </div>
        ) : null}

        {isLoading ? (
          <div className="grid gap-2 rounded-xl bg-cream p-4 shadow-sm ring-1 ring-ink/10" aria-label="Загружаем бронирования">
            {[0, 1, 2, 3, 4].map((item) => (
              <div key={item} className="h-16 animate-pulse rounded-lg bg-ink/5" />
            ))}
          </div>
        ) : (
          <ReservationList
            reservations={visibleReservations}
            onEdit={setEditingReservation}
            onMarkArrived={handleMarkArrived}
            onStatusChange={handleStatusChange}
          />
        )}
      </div>
      {isMapOpen ? (
        <HostessMapModal
          branch={currentBranch}
          date={date}
          reservations={mapReservations}
          isLoading={isMapLoading}
          error={mapError}
          onClose={() => setIsMapOpen(false)}
        />
      ) : null}
      {isAddOpen ? (
        <AddReservationModal
          branch={currentBranch}
          onClose={() => setIsAddOpen(false)}
          onSaved={refreshReservations}
        />
      ) : null}
      <EditReservationModal
        reservation={editingReservation}
        branch={currentBranch}
        onClose={() => setEditingReservation(null)}
        onSaved={refreshReservations}
      />
    </main>
  );
}

function Stat({ label, value, tone }) {
  const toneClasses = {
    total: 'border-ink/10 bg-cream',
    confirmed: 'border-emerald-700/15 bg-emerald-50',
    seated: 'border-sky-700/15 bg-sky-50',
    pending: 'border-amber-700/20 bg-amber-50',
  };

  return (
    <div className={`rounded-xl border p-4 shadow-sm ${toneClasses[tone] ?? toneClasses.total}`}>
      <p className="text-sm font-medium text-ink/65">{label}</p>
      <p className="mt-1 text-3xl font-semibold tabular-nums leading-none">{value}</p>
    </div>
  );
}
