import { useMemo, useState } from 'react';
import StatusBadge from './StatusBadge.jsx';

const ZONE_LABELS = {
  gazebo: 'Беседки',
  hookah: 'Кальянная',
  veranda: 'Ресторан',
  hall: 'Ресторан',
  main: 'Зал',
  terrace: 'Терраса',
  vip: 'VIP',
};

const STATUS_LABELS = {
  pending: 'Ожидает',
  confirmed: 'Подтверждено',
  seated: 'За столом',
  cancelled: 'Отменено',
};

const SORT_OPTIONS = [
  { key: 'time', label: 'Время' },
  { key: 'guest', label: 'Гость' },
  { key: 'zone', label: 'Зал' },
  { key: 'table', label: 'Стол' },
  { key: 'guests', label: 'Гостей' },
  { key: 'status', label: 'Статус' },
];

const STATUS_ACTIONS = [
  { status: 'pending', label: 'Ожидает' },
  { status: 'confirmed', label: 'Подтвердить' },
  { status: 'seated', label: 'Пришли' },
  { status: 'cancelled', label: 'Отменить' },
];
const collator = new Intl.Collator('ru', { numeric: true, sensitivity: 'base' });

function getReservationTables(reservation) {
  return reservation.tables?.length ? reservation.tables : reservation.table ? [reservation.table] : [];
}

function getTableLabel(reservation) {
  const tables = getReservationTables(reservation);
  return tables.length ? tables.map((table) => table.number).join(', ') : 'Не выбран';
}

function getZoneLabel(reservation) {
  const tables = getReservationTables(reservation);
  const zones = [...new Set(tables.map((table) => ZONE_LABELS[table.zone] ?? table.zone).filter(Boolean))];
  return zones.length ? zones.join(', ') : 'Не выбран';
}

function getSortValue(reservation, key) {
  if (key === 'time') return reservation.time ?? '';
  if (key === 'guest') return reservation.name ?? '';
  if (key === 'zone') return getZoneLabel(reservation);
  if (key === 'table') return getTableLabel(reservation);
  if (key === 'guests') return Number(reservation.guests_count) || 0;
  if (key === 'status') return STATUS_LABELS[reservation.status] ?? reservation.status ?? '';
  return '';
}

function PhoneConfirmBadge({ reservation }) {
  if (!reservation.confirm_by_phone) return null;

  return (
    <span className="mt-2 inline-flex w-fit rounded-full bg-amber-100 px-2.5 py-1 text-[0.7rem] font-bold text-amber-900 ring-1 ring-amber-700/15">
      Подтвердить по телефону
    </span>
  );
}

function SortHeader({ label, sortKey, sort, onSort }) {
  const isActive = sort.key === sortKey;
  const marker = isActive ? (sort.direction === 'asc' ? '↑' : '↓') : '↕';

  return (
    <th className="px-4 py-3 font-semibold">
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className="inline-flex items-center gap-1.5 rounded-md text-left transition hover:text-ink focus:outline-none focus:ring-2 focus:ring-wine focus:ring-offset-2 focus:ring-offset-[#EFEADF]"
      >
        {label}
        <span className={isActive ? 'text-wine' : 'text-ink/35'}>{marker}</span>
      </button>
    </th>
  );
}

function StatusActions({ reservation, onStatusChange }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {STATUS_ACTIONS.map((action) => (
        <button
          key={action.status}
          type="button"
          disabled={reservation.status === action.status}
          onClick={(event) => {
            event.stopPropagation();
            onStatusChange?.(reservation, action.status);
          }}
          className="rounded-lg bg-ink px-2.5 py-2 text-xs font-semibold text-white transition hover:bg-coffee disabled:cursor-not-allowed disabled:bg-ink/10 disabled:text-ink/45"
        >
          {action.label}
        </button>
      ))}
    </div>
  );
}
export default function ReservationList({ reservations, onEdit, onMarkArrived, onStatusChange }) {
  const [sort, setSort] = useState({ key: 'time', direction: 'asc' });

  const sortedReservations = useMemo(() => {
    return [...reservations].sort((left, right) => {
      const leftValue = getSortValue(left, sort.key);
      const rightValue = getSortValue(right, sort.key);
      const direction = sort.direction === 'asc' ? 1 : -1;

      if (typeof leftValue === 'number' && typeof rightValue === 'number') {
        return (leftValue - rightValue) * direction;
      }

      return collator.compare(String(leftValue), String(rightValue)) * direction;
    });
  }, [reservations, sort]);

  const updateSort = (key) => {
    setSort((current) => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  if (!reservations.length) {
    return (
      <div className="rounded-xl border border-dashed border-ink/20 bg-cream p-8 text-center shadow-sm">
        <p className="text-base font-semibold text-ink">На выбранную дату бронирований нет</p>
        <p className="mt-2 text-sm text-ink/60">Измените дату, статус или поиск, либо добавьте бронь вручную.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-ink/10 bg-cream shadow-sm">
      <div className="grid gap-3 border-b border-ink/10 bg-[#EFEADF] p-3 md:hidden">
        <label className="hostess-field">
          <span className="hostess-field-label">Сортировка</span>
          <select
            value={sort.key}
            onChange={(event) => setSort({ key: event.target.value, direction: 'asc' })}
            className="hostess-select"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.key} value={option.key}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={() => setSort((current) => ({ ...current, direction: current.direction === 'asc' ? 'desc' : 'asc' }))}
          className="rounded-lg border border-ink/10 bg-cream px-4 py-3 text-sm font-semibold text-ink shadow-sm"
        >
          {sort.direction === 'asc' ? 'По возрастанию' : 'По убыванию'}
        </button>
      </div>

      <div className="hidden overflow-x-auto md:block">
        <table className="min-w-full divide-y divide-ink/10 text-sm">
          <thead className="bg-[#EFEADF]">
            <tr className="text-left text-ink/70">
              {SORT_OPTIONS.map((option) => (
                <SortHeader
                  key={option.key}
                  label={option.label}
                  sortKey={option.key}
                  sort={sort}
                  onSort={updateSort}
                />
              ))}
              <th className="px-4 py-3 font-semibold">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/10">
            {sortedReservations.map((reservation) => (
              <tr
                key={reservation.id}
                className="cursor-pointer transition hover:bg-linen/70 focus-within:bg-linen/70"
                onClick={() => onEdit?.(reservation)}
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onEdit?.(reservation);
                  }
                }}
              >
                <td className="px-4 py-3 text-base font-semibold tabular-nums">{reservation.time}</td>
                <td className="px-4 py-3">
                  <div className="font-medium">{reservation.name}</div>
                  <div className="text-xs text-ink/55">{reservation.phone}</div>
                </td>
                <td className="px-4 py-3 font-medium">{getZoneLabel(reservation)}</td>
                <td className="px-4 py-3 font-medium">{getTableLabel(reservation)}</td>
                <td className="px-4 py-3 tabular-nums">{reservation.guests_count}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={reservation.status} />
                  <PhoneConfirmBadge reservation={reservation} />
                </td>
                <td className="px-4 py-3">
                  <StatusActions
                    reservation={reservation}
                    onStatusChange={onStatusChange ?? ((item, nextStatus) => {
                      if (nextStatus === 'seated') onMarkArrived?.(item);
                    })}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-2 p-2 md:hidden">
        {sortedReservations.map((reservation) => (
          <div
            key={reservation.id}
            role="button"
            tabIndex={0}
            onClick={() => onEdit?.(reservation)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onEdit?.(reservation);
              }
            }}
            className="rounded-lg bg-white p-4 text-left shadow-sm ring-1 ring-ink/10 transition hover:bg-linen focus:outline-none focus:ring-2 focus:ring-wine"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-lg font-semibold tabular-nums">{reservation.time}</p>
                <p className="mt-1 font-medium">{reservation.name}</p>
                <p className="text-sm text-ink/60">{reservation.phone}</p>
              </div>
              <div className="grid justify-items-end">
                <StatusBadge status={reservation.status} />
                <PhoneConfirmBadge reservation={reservation} />
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
              <div className="rounded-md bg-linen px-3 py-2">
                <p className="text-xs text-ink/55">Зал</p>
                <p className="font-semibold">{getZoneLabel(reservation)}</p>
              </div>
              <div className="rounded-md bg-linen px-3 py-2">
                <p className="text-xs text-ink/55">Стол</p>
                <p className="font-semibold">{getTableLabel(reservation)}</p>
              </div>
              <div className="rounded-md bg-linen px-3 py-2">
                <p className="text-xs text-ink/55">Гостей</p>
                <p className="font-semibold tabular-nums">{reservation.guests_count}</p>
              </div>
            </div>
            <div className="mt-3">
              <StatusActions
                reservation={reservation}
                onStatusChange={onStatusChange ?? ((item, nextStatus) => {
                  if (nextStatus === 'seated') onMarkArrived?.(item);
                })}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}



