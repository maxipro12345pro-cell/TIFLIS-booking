const DEFAULT_MAX_GUESTS = 12;

function toInteger(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function normalizeGuestBreakdown({ adultsCount = 2, childrenCount = 0, maxGuests = DEFAULT_MAX_GUESTS } = {}) {
  const adults = clamp(toInteger(adultsCount, 1), 1, maxGuests);
  const children = clamp(toInteger(childrenCount, 0), 0, Math.max(0, maxGuests - adults));

  return {
    adults_count: adults,
    children_count: children,
    guests_count: adults + children,
  };
}

export function buildGuestBreakdownNote({ adults_count, children_count }) {
  return `Состав гостей: взрослых ${adults_count}, детей ${children_count}.`;
}

export function mergeNotesWithGuestBreakdown(notes, breakdown) {
  const guestLine = buildGuestBreakdownNote(breakdown);
  const cleanNotes = String(notes ?? '').trim();

  return cleanNotes ? `${guestLine}\n${cleanNotes}` : guestLine;
}
