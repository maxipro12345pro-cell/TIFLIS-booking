import { useEffect, useMemo, useState } from 'react';
import StatusBadge from './StatusBadge.jsx';
import TableMap from './TableMap/TableMap.jsx';

const ZONE_LABELS = {
  gazebo: 'Беседки',
  hookah: 'Кальянная',
  veranda: 'Ресторан',
  hall: 'Ресторан',
  main: 'Зал',
  terrace: 'Терраса',
  vip: 'VIP',
};

function getReservationTables(reservation) {
  return reservation?.tables?.length ? reservation.tables : reservation?.table ? [reservation.table] : [];
}

function getInitialArea(branch, tables) {
  const firstZone = tables[0]?.zone;

  if (branch?.slug === 'ryscanovka') {
    if (firstZone === 'hookah') return 'hookah';
    if (firstZone === 'hall' || firstZone === 'veranda') return 'restaurant';
    return 'gazebo';
  }

  return firstZone === 'terrace' ? 'terrace' : 'main';
}

function getLocationLabel(tables) {
  if (!tables.length) return 'Место не выбрано';

  const zones = [...new Set(tables.map((table) => ZONE_LABELS[table.zone] ?? table.zone).filter(Boolean))];
  const tableNumbers = tables.map((table) => table.number).join(', ');

  return `${zones.join(', ')} · стол ${tableNumbers}`;
}

export default function EditReservationModal({ reservation, branch, onClose }) {
  const reservationTables = useMemo(() => getReservationTables(reservation), [reservation]);
  const selectedTableIds = useMemo(() => reservationTables.map((table) => table.id), [reservationTables]);
  const [activeArea, setActiveArea] = useState(() => getInitialArea(branch, reservationTables));

  useEffect(() => {
    setActiveArea(getInitialArea(branch, reservationTables));
  }, [branch, reservationTables]);

  if (!reservation) return null;

  return (
    <div className="hostess-edit-modal fixed inset-0 z-50 grid place-items-center bg-ink/55 p-3 backdrop-blur-sm sm:p-4">
      <div
        className="max-h-[94vh] w-full max-w-6xl overflow-auto rounded-xl bg-[#F7F3E8] p-4 shadow-[0_28px_90px_rgba(46,41,38,0.28)] ring-1 ring-ink/10 sm:p-5"
        role="dialog"
        aria-modal="true"
      >
        <div className="mb-4 flex items-start justify-between gap-4 border-b border-ink/10 pb-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-wine">Редактирование брони</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight">{reservation.name}</h2>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <StatusBadge status={reservation.status} />
              {reservation.confirm_by_phone ? (
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-900 ring-1 ring-amber-700/15">
                  Подтвердить по телефону
                </span>
              ) : null}
              <span className="rounded-full bg-ink/5 px-3 py-1 text-xs font-semibold text-ink/65">
                {getLocationLabel(reservationTables)}
              </span>
            </div>
          </div>
          <button className="rounded-lg px-3 py-2 text-sm font-semibold text-ink/70 transition hover:bg-ink/5 hover:text-ink focus:outline-none focus:ring-2 focus:ring-wine" onClick={onClose}>
            Закрыть
          </button>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.35fr)]">
          <form className="grid content-start gap-3 rounded-xl bg-cream p-4 shadow-sm ring-1 ring-ink/10 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            <input className="hostess-modal-input" defaultValue={reservation.name} aria-label="Имя" />
            <input className="hostess-modal-input" defaultValue={reservation.phone} aria-label="Телефон" />
            <input className="hostess-modal-input" defaultValue={reservation.date} type="date" aria-label="Дата" />
            <input className="hostess-modal-input" defaultValue={reservation.time} type="time" max="22:00" aria-label="Время" />
            <p className="booking-kitchen-note booking-kitchen-note-light sm:col-span-2 lg:col-span-1 xl:col-span-2">Кухня закрывается в 22:00</p>
            <select className="hostess-modal-input" defaultValue={reservation.status} aria-label="Статус">
              <option value="pending">Ожидает</option>
              <option value="confirmed">Подтверждено</option>
              <option value="seated">За столом</option>
              <option value="cancelled">Отменено</option>
            </select>
            <input className="hostess-modal-input" defaultValue={reservation.guests_count} type="number" min="1" max="12" aria-label="Гостей" />
            <label className="flex items-start gap-3 rounded-lg border border-ink/10 bg-white/60 px-3 py-3 text-sm font-semibold text-ink/75 sm:col-span-2 lg:col-span-1 xl:col-span-2">
              <input
                type="checkbox"
                checked={Boolean(reservation.confirm_by_phone)}
                readOnly
                className="mt-0.5 h-5 w-5 shrink-0 accent-[#7A1F22]"
              />
              <span>Подтвердить по телефону</span>
            </label>
            <textarea className="hostess-modal-input min-h-24 resize-y sm:col-span-2 lg:col-span-1 xl:col-span-2" defaultValue={reservation.notes ?? ''} aria-label="Пожелания" />
            <button type="button" className="rounded-lg bg-ink px-4 py-3 text-sm font-semibold text-white transition hover:bg-coffee focus:outline-none focus:ring-2 focus:ring-wine focus:ring-offset-2 focus:ring-offset-cream sm:col-span-2 lg:col-span-1 xl:col-span-2">
              Обновить бронь
            </button>
          </form>

          <section className="reservation-details-map rounded-xl bg-[#201814] p-3 text-cream shadow-sm ring-1 ring-ink/10">
            <div className="mb-3 flex flex-col gap-1 px-1">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-gold">Место брони на карте</p>
              <p className="text-sm text-cream/68">Выбранный стол подсвечен на схеме.</p>
            </div>
            {branch && selectedTableIds.length ? (
              <TableMap
                branch={branch}
                guestsCount={Number(reservation.guests_count) || 1}
                selectedTableIds={selectedTableIds}
                activeArea={activeArea}
                onAreaChange={setActiveArea}
                onSelectTable={() => {}}
              />
            ) : (
              <div className="grid min-h-[18rem] place-items-center rounded-2xl border border-cream/10 bg-cream/5 p-6 text-center text-sm font-semibold text-cream/70">
                Для этой брони стол не выбран.
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
