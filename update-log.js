// update-log.js
const fs = require('fs').promises;

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Не задан SUPABASE_URL или SUPABASE_KEY');
  process.exit(1);
}

;(async () => {
  try {
    console.log('⏳ Fetching from', SUPABASE_URL);
    const url = `${SUPABASE_URL}/rest/v1/tracks_log?select=date,artist,title&order=date.desc`;
    const res = await fetch(url, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
    });
    console.log('» Status:', res.status);

    const raw = await res.text();
    console.log('» Body preview:', raw.slice(0, 200).replace(/\n/g, ' '));

    if (!res.ok) {
      console.error('❌ Ошибка от Supabase:', raw);
      process.exit(1);
    }

    let data;
    try {
      data = JSON.parse(raw);
    } catch (err) {
      console.error('❌ Не смог распарсить JSON:\n', raw);
      throw err;
    }

    console.log(`✅ Получено записей: ${data.length}`);

    const items = data.map(
      ({ date, artist, title }) =>
        `<li>${date} — <strong>${artist}</strong> — ${title}</li>`
    );
    const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Tracks log</title></head>
<body><ul>\n${items.join('\n')}\n</ul></body></html>`;

    await fs.writeFile('public/tracks-log.html', html);
    console.log('✅ public/tracks-log.html обновлён');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
