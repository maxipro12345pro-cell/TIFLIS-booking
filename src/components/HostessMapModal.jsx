import { useMemo, useState } from 'react';
import StatusBadge from './StatusBadge.jsx';
import TableMap from './TableMap/TableMap.jsx';

function getReservationTableIds(reservation) {
  if (reservation.tables?.length) {
    return reservation.tables.map((table) => table.id);
  }

  return reservation.table?.id ? [reservation.table.id] : [];
}

function getReservationTableNumbers(reservation) {
  const tables = reservation.tables?.length ? reservation.tables : reservation.table ? [reservation.table] : [];
  return tables.map((table) => table.number).join(', ') || 'не выбран';
}

function getActiveReservations(reservations) {
  return reservations.filter((reservation) => reservation.status !== 'cancelled');
}

function getActiveReservedTableIds(reservations) {
  const ids = getActiveReservations(reservations).flatMap(getReservationTableIds);
  return [...new Set(ids)];
}

function buildReservationsByTable(reservations) {
  return getActiveReservations(reservations).reduce((itemsByTable, reservation) => {
    getReservationTableIds(reservation).forEach((tableId) => {
      itemsByTable[tableId] = itemsByTable[tableId] ?? [];
      itemsByTable[tableId].push(reservation);
    });

    return itemsByTable;
  }, {});
}

function buildTableAnnotations(reservations) {
  return getActiveReservations(reservations).reduce((annotations, reservation) => {
    getReservationTableIds(reservation).forEach((tableId) => {
      annotations[tableId] = annotations[tableId] ?? [];
      annotations[tableId].push({
        time: reservation.time,
        guests: `${reservation.guests_count} чел.`,
      });
    });

    return annotations;
  }, {});
}

export default function HostessMapModal({ branch, date, reservations = [], isLoading, error, onClose }) {
  const [activeArea, setActiveArea] = useState(branch?.slug === 'ryscanovka' ? 'gazebo' : 'main');
  const [inspectedTable, setInspectedTable] = useState(null);
  const activeReservations = useMemo(
    () => getActiveReservations(reservations).sort((left, right) => String(left.time).localeCompare(String(right.time))),
    [reservations],
  );
  const reservedTableIds = useMemo(() => getActiveReservedTableIds(reservations), [reservations]);
  const tableAnnotations = useMemo(() => buildTableAnnotations(reservations), [reservations]);
  const reservationsByTable = useMemo(() => buildReservationsByTable(reservations), [reservations]);
  const inspectedReservations = inspectedTable ? reservationsByTable[inspectedTable.id] ?? [] : [];

  if (!branch) return null;

  return (
    <div className="hostess-map-modal fixed inset-0 z-50 bg-ink/60 p-2 backdrop-blur-sm sm:grid sm:place-items-center sm:p-4">
      <div className="hostess-map-modal-card max-h-[96dvh] w-full max-w-7xl overflow-auto rounded-2xl bg-[#201814] p-3 text-cream shadow-[0_32px_110px_rgba(0,0,0,0.42)] ring-1 ring-gold/20 sm:p-5">
        <div className="hostess-map-modal-header mb-3 flex items-start justify-between gap-3 border-b border-cream/10 pb-3">
          <div className="min-w-0">
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-gold">TIFLIS · карта броней</p>
            <h2 className="font-display mt-1 text-2xl font-semibold leading-none sm:text-3xl">
              {branch.name} · {date}
            </h2>
            <p className="mt-1 text-sm text-cream/65">
              {activeReservations.length ? `Активные брони: ${activeReservations.length}` : 'На эту дату активных броней нет'}
            </p>
          </div>
          <button
            type="button"
            className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-lg border border-cream/15 px-3 py-2 text-sm font-semibold text-cream/80 transition hover:border-gold/60 hover:text-gold focus:outline-none focus:ring-2 focus:ring-gold"
            onClick={onClose}
          >
            Закрыть
          </button>
        </div>

        {error ? (
          <div className="mb-3 rounded-xl border border-wine/35 bg-wine/15 px-4 py-3 text-sm text-cream">
            Не удалось загрузить актуальные брони: {error}
          </div>
        ) : null}

        {isLoading ? (
          <div className="grid min-h-[22rem] place-items-center rounded-2xl border border-cream/10 bg-cream/5 text-sm font-semibold text-cream/70">
            Загружаем карту броней...
          </div>
        ) : (
          <div className="grid gap-4">
            <section className="hostess-map-primary rounded-2xl bg-[#120d08]/45 p-2 ring-1 ring-cream/10 sm:p-3">
              <TableMap
                branch={branch}
                guestsCount={1}
                reservedTableIds={reservedTableIds}
                tableAnnotations={tableAnnotations}
                allowDisabledTableClick
                onDisabledTableClick={setInspectedTable}
                activeArea={activeArea}
                onAreaChange={(area) => {
                  setActiveArea(area);
                  setInspectedTable(null);
                }}
                onSelectTable={() => {}}
              />
            </section>

            {inspectedTable ? (
              <section className="hostess-table-popover rounded-2xl border border-gold/20 bg-gold/10 p-3 sm:p-4">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-gold">Выбранный стол</p>
                    <h3 className="mt-1 text-xl font-semibold">Стол {inspectedTable.number}</h3>
                  </div>
                  <button
                    type="button"
                    className="rounded-lg px-2 py-1 text-xs font-semibold text-cream/70 transition hover:bg-cream/10 hover:text-cream"
                    onClick={() => setInspectedTable(null)}
                  >
                    Скрыть
                  </button>
                </div>
                <ReservationCards reservations={inspectedReservations} emptyText="Для этого стола нет активных броней." />
              </section>
            ) : null}

            <section className="hostess-reservation-list rounded-2xl border border-cream/10 bg-cream/5 p-3 sm:p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-gold">Брони на дату</p>
                  <h3 className="mt-1 text-xl font-semibold">{date}</h3>
                </div>
                <span className="rounded-full bg-cream/10 px-3 py-1 text-sm font-semibold text-cream/72">
                  {activeReservations.length}
                </span>
              </div>
              <ReservationCards reservations={activeReservations} showTable />
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

function ReservationCards({ reservations, showTable = false, emptyText = 'Броней пока нет.' }) {
  if (!reservations.length) {
    return <p className="rounded-xl border border-dashed border-cream/15 p-4 text-center text-sm font-semibold text-cream/55">{emptyText}</p>;
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {reservations.map((reservation) => (
        <article key={reservation.id} className="rounded-xl border border-cream/10 bg-[#120d08]/70 p-3 text-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-lg font-bold tabular-nums text-gold">{reservation.time}</p>
              <p className="mt-1 truncate font-semibold text-cream">{reservation.name}</p>
            </div>
            <StatusBadge status={reservation.status} />
          </div>
          <div className="mt-3 grid gap-1.5 text-cream/68">
            {showTable ? <p>Стол: <span className="text-cream">{getReservationTableNumbers(reservation)}</span></p> : null}
            <p>Гостей: <span className="text-cream">{reservation.guests_count}</span></p>
            <p>Телефон: <span className="text-cream">{reservation.phone}</span></p>
            {reservation.notes ? <p>Пожелания: <span className="text-cream">{reservation.notes}</span></p> : null}
          </div>
        </article>
      ))}
    </div>
  );
}