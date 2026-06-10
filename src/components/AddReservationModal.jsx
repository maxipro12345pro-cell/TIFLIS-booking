import { useEffect, useState } from 'react';
import TableMap from './TableMap/TableMap.jsx';
import { todayLocalIso } from '../lib/date.js';
import { mergeNotesWithGuestBreakdown, normalizeGuestBreakdown } from '../lib/guestCounts.js';
import { createReservation, getReservedTableIds } from '../lib/reservations.js';

function getInitialArea(branch) {
  return branch?.slug === 'ryscanovka' ? 'gazebo' : 'main';
}

function getTableZoneLabel(table) {
  const labels = {
    gazebo: 'Беседки',
    hookah: 'Кальянная',
    veranda: 'Ресторан',
    hall: 'Ресторан',
    main: 'Зал',
    terrace: 'Терраса',
    vip: 'VIP',
  };

  return labels[table?.zone] ?? table?.zone ?? 'Зал';
}

function isValidPhone(phone) {
  return phone.replace(/\D/g, '').length >= 11;
}

export default function AddReservationModal({ branch, onClose, onSaved }) {
  const [activeArea, setActiveArea] = useState(() => getInitialArea(branch));
  const [form, setForm] = useState({
    name: '',
    phone: '+373 ',
    date: todayLocalIso(),
    time: '15:00',
    adults_count: 2,
    children_count: 0,
    guests_count: 2,
    notes: '',
    confirm_by_phone: true,
  });
  const [selectedTable, setSelectedTable] = useState(null);
  const [reservedTableIds, setReservedTableIds] = useState([]);
  const [isLoadingTables, setIsLoadingTables] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setActiveArea(getInitialArea(branch));
    setSelectedTable(null);
  }, [branch]);

  useEffect(() => {
    if (!branch || !form.date || !form.time) {
      setReservedTableIds([]);
      return;
    }

    let isMounted = true;
    setIsLoadingTables(true);

    getReservedTableIds({
      branchId: branch.id,
      date: form.date,
      time: form.time,
    })
      .then((ids) => {
        if (isMounted) setReservedTableIds(ids);
      })
      .catch(() => {
        if (isMounted) setReservedTableIds([]);
      })
      .finally(() => {
        if (isMounted) setIsLoadingTables(false);
      });

    return () => {
      isMounted = false;
    };
  }, [branch, form.date, form.time]);

  if (!branch) return null;

  const updateForm = (patch) => {
    setForm((current) => ({ ...current, ...patch }));
    setError('');
  };

  const updateGuestBreakdown = (patch) => {
    setForm((current) => ({
      ...current,
      ...normalizeGuestBreakdown({
        adultsCount: patch.adultsCount ?? current.adults_count,
        childrenCount: patch.childrenCount ?? current.children_count,
      }),
    }));
    setSelectedTable(null);
    setError('');
  };

  const selectedTableId = selectedTable?.id ?? null;
  const selectedTableIsOccupied = selectedTableId ? reservedTableIds.includes(selectedTableId) : false;
  const selectedTableLabel = selectedTable
    ? `${getTableZoneLabel(selectedTable)}, стол ${selectedTable.number}`
    : 'Стол не выбран';

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!selectedTable) {
      setError('Выберите стол на карте.');
      return;
    }

    if (!isValidPhone(form.phone)) {
      setError('Укажите корректный номер телефона.');
      return;
    }

    setIsSubmitting(true);

    const guestBreakdown = normalizeGuestBreakdown({
      adultsCount: form.adults_count,
      childrenCount: form.children_count,
    });
    const notes = mergeNotesWithGuestBreakdown(form.notes, guestBreakdown);

    try {
      const occupiedTableIds = await getReservedTableIds({
        branchId: branch.id,
        date: form.date,
        time: form.time,
      });

      if (occupiedTableIds.includes(selectedTable.id)) {
        setReservedTableIds(occupiedTableIds);
        setError('Этот стол уже занят на выбранные дату и время.');
        return;
      }

      const reservation = await createReservation(
        {
          branch_id: branch.id,
          name: form.name.trim(),
          phone: form.phone.trim(),
          email: null,
          date: form.date,
          time: form.time,
          guests_count: guestBreakdown.guests_count,
          table_id: selectedTable.id,
          status: 'pending',
          notes,
          confirm_by_phone: form.confirm_by_phone,
        },
        { tableIds: [selectedTable.id] },
      );

      onSaved?.(reservation);
      onClose();
    } catch (submitError) {
      setError(submitError.message ?? 'Не удалось сохранить бронь.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/55 p-3 backdrop-blur-sm sm:p-4">
      <div className="max-h-[92vh] w-full max-w-6xl overflow-auto rounded-xl bg-[#F7F3E8] p-4 shadow-[0_28px_90px_rgba(46,41,38,0.28)] ring-1 ring-ink/10 sm:p-5" role="dialog" aria-modal="true">
        <div className="mb-4 flex items-start justify-between gap-4 border-b border-ink/10 pb-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-wine">Новая бронь</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight">{branch.name}</h2>
            <p className="mt-1 text-sm text-ink/58">{selectedTableLabel}</p>
          </div>
          <button className="rounded-lg px-3 py-2 text-sm font-semibold text-ink/70 transition hover:bg-ink/5 hover:text-ink focus:outline-none focus:ring-2 focus:ring-wine" onClick={onClose}>
            Закрыть
          </button>
        </div>
        <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
          <form onSubmit={handleSubmit} className="space-y-3 rounded-xl bg-cream p-4 shadow-sm ring-1 ring-ink/10">
            <input
              className="hostess-modal-input"
              placeholder="Имя"
              required
              value={form.name}
              onChange={(event) => updateForm({ name: event.target.value })}
            />
            <input
              className="hostess-modal-input"
              placeholder="+373"
              required
              value={form.phone}
              onChange={(event) => updateForm({ phone: event.target.value })}
            />
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <input className="hostess-modal-input" type="date" required value={form.date} onChange={(event) => updateForm({ date: event.target.value })} />
              <input className="hostess-modal-input" type="time" required value={form.time} onChange={(event) => updateForm({ time: event.target.value })} />
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <label className="text-xs font-bold uppercase tracking-[0.12em] text-ink/55">
                Взрослые
                <input
                  className="hostess-modal-input mt-1"
                  type="number"
                  min="1"
                  max="12"
                  required
                  value={form.adults_count}
                  onChange={(event) => updateGuestBreakdown({ adultsCount: event.target.value })}
                />
              </label>
              <label className="text-xs font-bold uppercase tracking-[0.12em] text-ink/55">
                Дети
                <input
                  className="hostess-modal-input mt-1"
                  type="number"
                  min="0"
                  max="12"
                  required
                  value={form.children_count}
                  onChange={(event) => updateGuestBreakdown({ childrenCount: event.target.value })}
                />
              </label>
              <p className="rounded-lg border border-ink/10 bg-white/60 px-3 py-2 text-sm font-semibold text-ink/70 sm:col-span-2 lg:col-span-1">
                Всего гостей: {form.guests_count}
              </p>
            </div>
            <label className="flex items-start gap-3 rounded-lg border border-ink/10 bg-white/60 px-3 py-3 text-sm font-semibold text-ink/75">
              <input
                type="checkbox"
                checked={form.confirm_by_phone}
                onChange={(event) => updateForm({ confirm_by_phone: event.target.checked })}
                className="mt-0.5 h-5 w-5 shrink-0 accent-[#7A1F22]"
              />
              <span>
                Подтвердить по телефону
                <small className="mt-1 block text-xs font-medium text-ink/50">Будет видно в списке и деталях брони.</small>
              </span>
            </label>
            <textarea
              className="hostess-modal-input min-h-24 resize-y"
              placeholder="Пожелания"
              value={form.notes}
              onChange={(event) => updateForm({ notes: event.target.value })}
            />
            {selectedTableIsOccupied ? (
              <p className="rounded-lg border border-wine/25 bg-wine/10 px-3 py-2 text-sm font-semibold text-wine">
                Выбранный стол уже занят на это время.
              </p>
            ) : null}
            {error ? <p className="rounded-lg border border-wine/25 bg-wine/10 px-3 py-2 text-sm font-semibold text-wine">{error}</p> : null}
            <button
              type="submit"
              disabled={isSubmitting || isLoadingTables || selectedTableIsOccupied}
              className="w-full rounded-lg bg-ink px-4 py-3 text-sm font-semibold text-white transition hover:bg-coffee focus:outline-none focus:ring-2 focus:ring-wine focus:ring-offset-2 focus:ring-offset-cream disabled:cursor-not-allowed disabled:bg-ink/25"
            >
              {isSubmitting ? 'Сохраняем...' : 'Сохранить бронь'}
            </button>
          </form>
          <TableMap
            branch={branch}
            guestsCount={Number(form.guests_count) || 1}
            reservedTableIds={reservedTableIds}
            selectedTableId={selectedTableId}
            onSelectTable={(table) => {
              setSelectedTable(table);
              setError('');
            }}
            activeArea={activeArea}
            onAreaChange={setActiveArea}
          />
        </div>
      </div>
    </div>
  );
}
