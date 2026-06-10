export async function sendGuestConfirmation({ reservation, branch, table, tables = [] }) {
  if (!reservation.email) {
    return { skipped: true };
  }

  const response = await fetch('/api/send-confirmation', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      to: reservation.email,
      reservation,
      branch,
      table,
      tables,
    }),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error ?? 'Не удалось отправить email-подтверждение');
  }

  return response.json();
}
