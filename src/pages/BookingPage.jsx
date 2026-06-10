import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, ChevronLeft, Info, MapPin, Phone, UsersRound, X } from 'lucide-react';
import { Navigate, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { LuxuryReveal } from '../components/LuxuryMotion.jsx';
import TableMap from '../components/TableMap/TableMap.jsx';
import TiflisLogo from '../components/TiflisLogo.jsx';
import { useBranch } from '../hooks/useBranch.js';
import { useTranslation } from '../hooks/useTranslation.js';
import { buildGoogleMapsHref, buildPhoneHref } from '../lib/contactLinks.js';
import { todayLocalIso } from '../lib/date.js';
import { sendGuestConfirmation } from '../lib/email.js';
import { mergeNotesWithGuestBreakdown, normalizeGuestBreakdown } from '../lib/guestCounts.js';
import { createReservation, getReservedTableIds } from '../lib/reservations.js';

const RYSCANOVKA_AREA_IDS = ['gazebo', 'hookah', 'restaurant'];
const CENTER_AREA_IDS = ['main', 'terrace'];

function buildSlots(hoursRange) {
  const [start = '11:00', end = '23:00'] = (hoursRange ?? '11:00-23:00').split('-');
  const [startHour, startMinute] = start.split(':').map(Number);
  const [endHour, endMinute] = end.split(':').map(Number);
  const slots = [];
  const cursor = new Date();
  cursor.setHours(startHour, startMinute, 0, 0);
  const finish = new Date();
  finish.setHours(endHour, endMinute, 0, 0);

  if (finish <= cursor) {
    finish.setDate(finish.getDate() + 1);
  }

  while (cursor < finish) {
    slots.push(cursor.toTimeString().slice(0, 5));
    cursor.setMinutes(cursor.getMinutes() + 30);
  }

  return slots;
}

function isValidRequiredPhone(phone) {
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 11;
}

function NumberStepper({ label, min, max, value, onChange }) {
  const numericValue = Number(value);
  const changeBy = (delta) => {
    const nextValue = Math.min(max, Math.max(min, numericValue + delta));
    onChange(String(nextValue));
  };

  return (
    <div className="booking-stepper">
      <span className="booking-stepper-label">{label}</span>
      <div className="booking-stepper-controls">
        <button
          type="button"
          onClick={() => changeBy(-1)}
          disabled={numericValue <= min}
          aria-label={`${label} -1`}
        >
          -
        </button>
        <input
          type="number"
          min={min}
          max={max}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="booking-stepper-input"
        />
        <button
          type="button"
          onClick={() => changeBy(1)}
          disabled={numericValue >= max}
          aria-label={`${label} +1`}
        >
          +
        </button>
      </div>
    </div>
  );
}

function TimeStepper({ bookingCopy, slots, value, onChange }) {
  const currentIndex = Math.max(0, slots.indexOf(value));
  const hasSlots = slots.length > 0;

  const changeBy = (delta) => {
    if (!hasSlots) return;
    const nextIndex = Math.min(slots.length - 1, Math.max(0, currentIndex + delta));
    onChange(slots[nextIndex]);
  };

  return (
    <label className="block text-sm font-semibold text-cream">
      {bookingCopy.time}
      <div className="booking-time-stepper mt-2">
        <button
          type="button"
          onClick={() => changeBy(-1)}
          disabled={!hasSlots || currentIndex <= 0}
          aria-label={`${bookingCopy.time} -`}
        >
          -
        </button>
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="booking-field min-h-12 flex-1 appearance-none bg-transparent px-4 text-center outline-none"
        >
          {slots.map((slot) => (
            <option key={slot} value={slot}>
              {slot}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => changeBy(1)}
          disabled={!hasSlots || currentIndex >= slots.length - 1}
          aria-label={`${bookingCopy.time} +`}
        >
          +
        </button>
      </div>
    </label>
  );
}

function GuestBreakdownFields({ bookingCopy, adultsCount, childrenCount, onChange }) {
  const totalGuests = Number(adultsCount) + Number(childrenCount);

  return (
    <div className="booking-guest-breakdown">
      <NumberStepper
        label={bookingCopy.adults}
        min={1}
        max={12}
        value={adultsCount}
        onChange={(nextValue) => onChange({ adultsCount: nextValue })}
      />
      <NumberStepper
        label={bookingCopy.children}
        min={0}
        max={12}
        value={childrenCount}
        onChange={(nextValue) => onChange({ childrenCount: nextValue })}
      />
      <div className="booking-guest-total">
        {bookingCopy.totalGuests}: <span>{totalGuests}</span>
      </div>
    </div>
  );
}

function BookingDetailsSummary({
  bookingCopy,
  form,
  selectedZoneLabel,
  selectedTableNumbers,
  guestBreakdown,
  isBanquetMode,
  selectedCapacity,
}) {
  return (
    <div className="booking-summary rounded-lg p-4 text-sm">
      <p>{bookingCopy.summaryDate}: {form.date}</p>
      <p>{bookingCopy.summaryTime}: {form.time}</p>
      <p>{bookingCopy.summaryZone}: {selectedZoneLabel}</p>
      <p>{bookingCopy.summaryTable}: {selectedTableNumbers || bookingCopy.chooseOnMap}</p>
      <p>{bookingCopy.summaryGuests}: {guestBreakdown.guests_count}</p>
      <p>{bookingCopy.adults}: {guestBreakdown.adults_count}</p>
      <p>{bookingCopy.children}: {guestBreakdown.children_count}</p>
      {isBanquetMode ? <p>{bookingCopy.totalCapacity}: {selectedCapacity}</p> : null}
    </div>
  );
}

function BookingSettingsContent({
  bookingCopy,
  form,
  slots,
  updateForm,
  updateGuestBreakdown,
  selectedZoneLabel,
  selectedTableNumbers,
  guestBreakdown,
  isBanquetMode,
  selectedCapacity,
  confirmByPhone,
  setConfirmByPhone,
  isSubmitting,
  selectedTablesLength,
  controlsClassName = 'grid gap-4',
  contactClassName = 'mt-5 space-y-4',
  showSummary = true,
  showEmail = true,
}) {
  const resetTableSelection = (patch) => updateForm({ ...patch, table: null, tables: [] });

  return (
    <>
      <div className={controlsClassName}>
        <label className="block text-sm font-semibold text-cream">
          {bookingCopy.date}
          <div className="booking-field-shell mt-2 flex items-center overflow-hidden rounded-lg">
            <input
              type="date"
              min={todayLocalIso()}
              value={form.date}
              onChange={(event) => resetTableSelection({ date: event.target.value })}
              className="booking-field min-h-12 flex-1 bg-transparent px-5 outline-none"
            />
            <CalendarDays className="mr-4 h-5 w-5 text-sage" aria-hidden="true" />
          </div>
        </label>

        <TimeStepper
          bookingCopy={bookingCopy}
          slots={slots}
          value={form.time}
          onChange={(nextTime) => resetTableSelection({ time: nextTime })}
        />

        <div className="block">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-cream">
            <UsersRound className="h-4 w-4 text-sage" aria-hidden="true" />
            {bookingCopy.guests}
          </div>
          <GuestBreakdownFields
            bookingCopy={bookingCopy}
            adultsCount={form.adults_count}
            childrenCount={form.children_count}
            onChange={updateGuestBreakdown}
          />
        </div>
      </div>

      {showSummary ? (
        <div className="mt-4">
          <BookingDetailsSummary
            bookingCopy={bookingCopy}
            form={form}
            selectedZoneLabel={selectedZoneLabel}
            selectedTableNumbers={selectedTableNumbers}
            guestBreakdown={guestBreakdown}
            isBanquetMode={isBanquetMode}
            selectedCapacity={selectedCapacity}
          />
        </div>
      ) : null}

      <div className={contactClassName}>
        <input
          required
          placeholder={bookingCopy.namePlaceholder}
          value={form.name}
          onChange={(event) => updateForm({ name: event.target.value })}
          className="booking-field min-h-11 w-full rounded-lg px-4 outline-none"
        />
        <input
          required
          placeholder="+373"
          value={form.phone}
          onChange={(event) => updateForm({ phone: event.target.value })}
          pattern="^\+?\d[\d\s()\-]{7,}$"
          className="booking-field min-h-11 w-full rounded-lg px-4 outline-none"
        />
        {showEmail ? (
          <input
            type="email"
            placeholder={bookingCopy.emailPlaceholder}
            value={form.email}
            onChange={(event) => updateForm({ email: event.target.value })}
            className="booking-field min-h-11 w-full rounded-lg px-4 outline-none"
          />
        ) : null}
        <textarea
          placeholder={bookingCopy.notesPlaceholder}
          value={form.notes}
          onChange={(event) => updateForm({ notes: event.target.value })}
          className="booking-field min-h-24 w-full rounded-lg px-4 py-3 outline-none"
        />
      </div>

      <label className="booking-phone-confirm mt-4 flex items-start gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-cream/86">
        <input
          type="checkbox"
          checked={confirmByPhone}
          disabled={isBanquetMode}
          onChange={(event) => setConfirmByPhone(event.target.checked)}
          className="mt-0.5 h-5 w-5 shrink-0 accent-[#C28A2E] disabled:cursor-not-allowed"
        />
        <span>
          {bookingCopy.confirmByPhone}
          {isBanquetMode ? (
            <small className="mt-1 block text-xs font-medium text-gold/80">
              {bookingCopy.requiredForBanquet}
            </small>
          ) : null}
        </span>
      </label>

      <motion.button
        disabled={isSubmitting || selectedTablesLength === 0}
        className="booking-primary-button mt-5 w-full disabled:cursor-not-allowed disabled:bg-cream/15 disabled:text-cream/45 disabled:shadow-none"
        whileTap={{ scale: 0.98 }}
      >
        {isSubmitting ? bookingCopy.submitting : bookingCopy.submit}
      </motion.button>
    </>
  );
}

export default function BookingPage() {
  const navigate = useNavigate();
  const { currentBranch } = useBranch();
  const { copy } = useTranslation();
  const bookingCopy = copy.booking;
  const [activeArea, setActiveArea] = useState('gazebo');
  const [isBanquetMode, setIsBanquetMode] = useState(false);
  const [confirmByPhone, setConfirmByPhone] = useState(true);
  const [mergeWarning, setMergeWarning] = useState('');
  const [form, setForm] = useState({
    date: todayLocalIso(),
    time: '15:00',
    adults_count: 2,
    children_count: 0,
    guests_count: 2,
    table: null,
    tables: [],
    name: '',
    phone: '+373 ',
    email: '',
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [reservedTableIds, setReservedTableIds] = useState([]);
  const [isDetailsPopoverOpen, setIsDetailsPopoverOpen] = useState(false);

  const slots = useMemo(() => {
    if (!currentBranch) return [];
    const day = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][new Date(form.date).getDay()];
    return buildSlots(currentBranch.working_hours?.[day]);
  }, [currentBranch, form.date]);

  const areaIds = currentBranch?.slug === 'ryscanovka' ? RYSCANOVKA_AREA_IDS : CENTER_AREA_IDS;
  const areas = areaIds.map((id) => ({ id, label: copy.areaLabels[id] }));
  const branchName = copy.branches[currentBranch?.slug]?.name ?? currentBranch?.name;
  const mapsHref = buildGoogleMapsHref(currentBranch?.address, currentBranch?.mapsUrl);
  const phoneHref = buildPhoneHref(currentBranch?.phone);

  useEffect(() => {
    if (!currentBranch) return;
    setActiveArea(currentBranch.slug === 'ryscanovka' ? 'gazebo' : 'main');
    setForm((current) => ({ ...current, table: null }));
    setIsDetailsPopoverOpen(false);
  }, [currentBranch]);

  useEffect(() => {
    if (!currentBranch || !form.date || !form.time) {
      setReservedTableIds([]);
      return;
    }

    getReservedTableIds({
      branchId: currentBranch.id,
      date: form.date,
      time: form.time,
    })
      .then(setReservedTableIds)
      .catch(() => setReservedTableIds([]));
  }, [currentBranch, form.date, form.time]);

  if (!currentBranch) {
    return <Navigate to="/" replace />;
  }

  const updateForm = (patch) => setForm((current) => ({ ...current, ...patch }));
  const updateGuestBreakdown = (patch) => {
    setForm((current) => {
      const nextBreakdown = normalizeGuestBreakdown({
        adultsCount: patch.adultsCount ?? current.adults_count,
        childrenCount: patch.childrenCount ?? current.children_count,
      });

      return { ...current, ...nextBreakdown, table: null, tables: [] };
    });
  };

  const submitReservation = async (event) => {
    event.preventDefault();
    setSubmitError('');

    if (!isValidRequiredPhone(form.phone)) {
      setSubmitError(bookingCopy.phoneRequiredError);
      return;
    }

    if (isBanquetMode && !confirmByPhone) {
      setSubmitError(bookingCopy.phoneConfirmRequiredError);
      return;
    }

    setIsSubmitting(true);

    const guestBreakdown = normalizeGuestBreakdown({
      adultsCount: form.adults_count,
      childrenCount: form.children_count,
    });
    const notes = mergeNotesWithGuestBreakdown(form.notes, guestBreakdown);

    const selectedTables = isBanquetMode ? form.tables : form.table ? [form.table] : [];
    const selectedTableIds = selectedTables.map((table) => table.id);

    try {
      const reservation = await createReservation(
        {
          branch_id: currentBranch.id,
          name: form.name,
          phone: form.phone,
          email: form.email || null,
          date: form.date,
          time: form.time,
          guests_count: guestBreakdown.guests_count,
          table_id: selectedTables[0]?.id ?? null,
          status: 'pending',
          notes,
          confirm_by_phone: confirmByPhone,
        },
        { tableIds: selectedTableIds },
      );

      await sendGuestConfirmation({
        reservation,
        branch: currentBranch,
        table: selectedTables[0],
        tables: selectedTables,
      }).catch(() => null);

      navigate('/confirmation', {
        state: {
          reservation,
          branch: currentBranch,
          table: selectedTables[0],
          tables: selectedTables,
        },
      });
    } catch (error) {
      setSubmitError(error.message ?? bookingCopy.createError);
    } finally {
      setIsSubmitting(false);
    }
  };

  const guestBreakdown = normalizeGuestBreakdown({
    adultsCount: form.adults_count,
    childrenCount: form.children_count,
  });
  const selectedTables = isBanquetMode ? form.tables : form.table ? [form.table] : [];
  const selectedCapacity = selectedTables.reduce((sum, table) => sum + table.capacity, 0);
  const selectedTableNumbers = selectedTables.map((table) => table.number).join(', ');
  const selectedZoneLabel = areas.find((area) => area.id === activeArea)?.label ?? copy.areaLabels.main;

  const handleTableSelect = (table) => {
    setMergeWarning('');

    if (!isBanquetMode) {
      if (form.table?.id === table.id) {
        setIsDetailsPopoverOpen(true);
        return;
      }

      setIsDetailsPopoverOpen(true);
      updateForm({ table, tables: [] });
      return;
    }

    const alreadySelected = form.tables.some((item) => item.id === table.id);

    if (alreadySelected) {
      setIsDetailsPopoverOpen(true);
      return;
    }

    if (!alreadySelected && !canMergeTable(form.tables, table)) {
      setMergeWarning(bookingCopy.mergeWarning);
      return;
    }

    setIsDetailsPopoverOpen(true);
    updateForm({
      table: null,
      tables: [...form.tables, table],
    });
  };

  return (
    <main className="booking-screen">
      <div className="booking-shell">
        <LuxuryReveal as="header" className="booking-guest-header">
          <div className="max-w-3xl">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="mb-5 inline-flex items-center gap-2 rounded-full border border-cream/15 bg-cream/5 px-4 py-2 text-sm font-semibold text-cream/75 transition hover:border-gold/70 hover:text-gold"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              {bookingCopy.backToBranches}
            </button>
            <div className="flex items-center gap-4">
              <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full border border-gold/40 bg-cream/10 shadow-[0_18px_50px_rgba(0,0,0,0.2)]">
                <TiflisLogo className="h-10 w-10 text-cream" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-gold">
                  TIFLIS · {branchName}
                </p>
                <h1 className="font-display mt-2 text-4xl font-semibold leading-none text-cream sm:text-5xl">
                  {bookingCopy.title}
                </h1>
              </div>
            </div>
          </div>
          <div className="booking-contact-strip">
            <a
              href={mapsHref}
              target="_blank"
              rel="noreferrer"
              className="booking-contact-link inline-flex items-center gap-2"
            >
              <MapPin className="h-4 w-4 text-gold" aria-hidden="true" />
              {currentBranch.address}
            </a>
            <a href={phoneHref} className="booking-contact-link inline-flex items-center gap-2">
              <Phone className="h-4 w-4 text-gold" aria-hidden="true" />
              {currentBranch.phone}
            </a>
          </div>
        </LuxuryReveal>

        <form onSubmit={submitReservation} className="booking-layout">
          <LuxuryReveal as="section" className="space-y-6" delay={0.08}>
            <div className="booking-step-surface booking-date-controls booking-date-controls-desktop grid gap-5 p-4 md:p-5 lg:grid-cols-3">
              <label className="block text-sm font-semibold text-cream">
                {bookingCopy.date}
                <div className="booking-field-shell mt-2 flex items-center overflow-hidden rounded-lg">
                  <input
                    type="date"
                    min={todayLocalIso()}
                    value={form.date}
                    onChange={(event) => updateForm({ date: event.target.value, table: null })}
                    className="booking-field min-h-12 flex-1 bg-transparent px-5 outline-none"
                  />
                  <CalendarDays className="mr-4 h-5 w-5 text-sage" aria-hidden="true" />
                </div>
              </label>

              <TimeStepper
                bookingCopy={bookingCopy}
                slots={slots}
                value={form.time}
                onChange={(nextTime) => updateForm({ time: nextTime, table: null })}
              />

              <div className="block">
                <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-cream">
                  <UsersRound className="h-4 w-4 text-sage" aria-hidden="true" />
                  {bookingCopy.guests}
                </div>
                <GuestBreakdownFields
                  bookingCopy={bookingCopy}
                  adultsCount={form.adults_count}
                  childrenCount={form.children_count}
                  onChange={updateGuestBreakdown}
                />
              </div>
            </div>

            <div className="booking-step-surface flex flex-wrap items-center justify-between gap-3 px-4 py-3">
              <label className="inline-flex items-center gap-3 text-sm font-semibold text-cream">
                <input
                  type="checkbox"
                  checked={isBanquetMode}
                  onChange={(event) => {
                    setIsBanquetMode(event.target.checked);
                    if (event.target.checked) setConfirmByPhone(true);
                    updateForm({ table: null, tables: [] });
                  }}
                  className="h-5 w-5 accent-[#C28A2E]"
                />
                {bookingCopy.banquetMode}
              </label>
              <div className="text-sm text-cream/70">
                {isBanquetMode
                  ? `${bookingCopy.selected}: ${selectedTables.length || 0} · ${bookingCopy.seats}: ${selectedCapacity}`
                  : bookingCopy.regularMode}
              </div>
            </div>
            {mergeWarning ? (
              <div className="rounded-md border border-gold/40 bg-gold/10 px-4 py-3 text-sm text-gold">
                {mergeWarning}
              </div>
            ) : null}
            {submitError ? (
              <div className="rounded-md border border-wine/50 bg-wine/15 px-4 py-3 text-sm text-cream">
                {submitError}
              </div>
            ) : null}

            <LuxuryReveal subtle delay={0.12}>
              <TableMap
                branch={currentBranch}
                guestsCount={guestBreakdown.guests_count}
                reservedTableIds={reservedTableIds}
                selectedTableId={form.table?.id}
                selectedTableIds={form.tables.map((table) => table.id)}
                onSelectTable={handleTableSelect}
                activeArea={activeArea}
                onAreaChange={(area) => {
                  setActiveArea(area);
                  setIsDetailsPopoverOpen(false);
                  updateForm({ table: null, tables: [] });
                }}
                variant="dark"
              />
              <AnimatePresence mode="wait">
                {selectedTables.length && isDetailsPopoverOpen ? (
                  <motion.div
                    className="booking-details-modal-backdrop"
                    role="presentation"
                    onClick={() => setIsDetailsPopoverOpen(false)}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
                  >
                    <motion.div
                      className="booking-details-modal"
                      role="dialog"
                      aria-modal="true"
                      aria-labelledby="booking-details-modal-title"
                      onClick={(event) => event.stopPropagation()}
                      initial={{ opacity: 0, y: 24, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 18, scale: 0.97 }}
                      transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <div className="booking-selected-popover-heading">
                        <div className="booking-selected-popover-title-row">
                          <div className="booking-selected-popover-icon" aria-hidden="true">
                            <Info className="h-5 w-5" />
                          </div>
                          <h3 id="booking-details-modal-title" className="booking-selected-popover-title">
                            {bookingCopy.details}
                          </h3>
                        </div>
                        <button
                          type="button"
                          className="booking-selected-popover-close"
                          onClick={() => setIsDetailsPopoverOpen(false)}
                          aria-label={copy.hostess?.close ?? 'Close'}
                        >
                          <X className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>
                      <BookingSettingsContent
                        bookingCopy={bookingCopy}
                        form={form}
                        slots={slots}
                        updateForm={updateForm}
                        updateGuestBreakdown={updateGuestBreakdown}
                        selectedZoneLabel={selectedZoneLabel}
                        selectedTableNumbers={selectedTableNumbers}
                        guestBreakdown={guestBreakdown}
                        isBanquetMode={isBanquetMode}
                        selectedCapacity={selectedCapacity}
                        confirmByPhone={confirmByPhone}
                        setConfirmByPhone={setConfirmByPhone}
                        isSubmitting={isSubmitting}
                        selectedTablesLength={selectedTables.length}
                        controlsClassName="booking-modal-controls grid gap-4"
                        contactClassName="booking-modal-contact-row mt-5"
                        showSummary={false}
                        showEmail={false}
                      />
                    </motion.div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </LuxuryReveal>
          </LuxuryReveal>

          <LuxuryReveal as="aside" className="booking-side-panel h-fit rounded-xl p-5 shadow-soft lg:sticky lg:top-6" delay={0.16} subtle>
            <h2 className="font-display text-3xl font-semibold leading-none">{bookingCopy.details}</h2>
            <BookingSettingsContent
              bookingCopy={bookingCopy}
              form={form}
              slots={slots}
              updateForm={updateForm}
              updateGuestBreakdown={updateGuestBreakdown}
              selectedZoneLabel={selectedZoneLabel}
              selectedTableNumbers={selectedTableNumbers}
              guestBreakdown={guestBreakdown}
              isBanquetMode={isBanquetMode}
              selectedCapacity={selectedCapacity}
              confirmByPhone={confirmByPhone}
              setConfirmByPhone={setConfirmByPhone}
              isSubmitting={isSubmitting}
              selectedTablesLength={selectedTables.length}
              controlsClassName="booking-date-controls booking-date-controls-mobile mt-4 grid gap-4"
            />
          </LuxuryReveal>
        </form>
      </div>
    </main>
  );
}

function canMergeTable(selectedTables, nextTable) {
  if (selectedTables.length === 0) return true;

  const firstTable = selectedTables[0];
  const firstGroup = firstTable.mergeGroup ?? firstTable.id;
  const nextGroup = nextTable.mergeGroup ?? nextTable.id;

  return firstTable.zone === nextTable.zone && firstGroup === nextGroup;
}
