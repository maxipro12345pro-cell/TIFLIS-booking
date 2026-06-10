const RESEND_API_URL = 'https://api.resend.com/emails';

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function buildHtml({ reservation, branch, table, tables = [] }) {
  const selectedTables = tables.length ? tables : table ? [table] : [];
  const tableLabel = selectedTables.length
    ? selectedTables.map((item) => item.number).join(', ')
    : 'назначит хостес';

  return `
    <div style="font-family: Arial, sans-serif; color: #1f2523; line-height: 1.55;">
      <h1>Бронирование получено</h1>
      <p>Здравствуйте, ${escapeHtml(reservation.name)}. TIFLIS получил вашу заявку и скоро подтвердит бронь.</p>
      <table cellpadding="8" cellspacing="0" style="border-collapse: collapse; margin-top: 16px;">
        <tr><td><strong>Ресторан</strong></td><td>TIFLIS · ${escapeHtml(branch.name)}</td></tr>
        <tr><td><strong>Адрес</strong></td><td>${escapeHtml(branch.address)}</td></tr>
        <tr><td><strong>Дата</strong></td><td>${escapeHtml(reservation.date)}</td></tr>
        <tr><td><strong>Время</strong></td><td>${escapeHtml(reservation.time)}</td></tr>
        <tr><td><strong>Гостей</strong></td><td>${escapeHtml(reservation.guests_count)}</td></tr>
        <tr><td><strong>Стол</strong></td><td>${escapeHtml(tableLabel)}</td></tr>
      </table>
      <p style="margin-top: 20px;">Если планы изменятся, позвоните нам: ${escapeHtml(branch.phone ?? 'номер филиала уточняется')}.</p>
    </div>
  `;
}

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;

  if (!apiKey || !from) {
    return response.status(500).json({ error: 'Resend не настроен на сервере' });
  }

  const { to, reservation, branch, table, tables } = request.body ?? {};

  if (!to || !reservation || !branch) {
    return response.status(400).json({ error: 'Недостаточно данных для письма' });
  }

  const resendResponse = await fetch(RESEND_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to,
      subject: `Бронирование: ${branch.name}, ${reservation.date} ${reservation.time}`,
      html: buildHtml({ reservation, branch, table, tables }),
    }),
  });

  const payload = await resendResponse.json();

  if (!resendResponse.ok) {
    return response.status(resendResponse.status).json({
      error: payload.message ?? 'Resend вернул ошибку',
    });
  }

  return response.status(200).json(payload);
}
