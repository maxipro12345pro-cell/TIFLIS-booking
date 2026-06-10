const STATUS_LABELS = {
  pending: 'Ожидает',
  confirmed: 'Подтверждено',
  seated: 'За столом',
  cancelled: 'Отменено',
};

const STATUS_CLASSES = {
  pending: 'bg-amber-100 text-amber-900 ring-amber-700/20',
  confirmed: 'bg-emerald-100 text-emerald-900 ring-emerald-700/20',
  seated: 'bg-sky-100 text-sky-900 ring-sky-700/20',
  cancelled: 'bg-stone-200 text-stone-800 ring-stone-700/20',
};

export default function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${
        STATUS_CLASSES[status] ?? STATUS_CLASSES.pending
      }`}
    >
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}
