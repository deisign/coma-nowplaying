// update-log.js
// Инкрементальное обновление JSON-хранилища + пагинация по 2000 записей

const fs = require('fs').promises;
const path = require('path');

// Константы
const JSON_STORE     = path.resolve(__dirname, 'tracks-log.json');
const ITEMS_PER_PAGE = 2000;
const PAGE_PREFIX    = 'tracks-log-page';
const FIRST_PAGE     = 'tracks-log.html';

// Supabase из ENV
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Не заданы SUPABASE_URL/SUPABASE_KEY');
  process.exit(1);
}

;(async () => {
  // 1) Загружаем существующий JSON-лог (если есть)
  let log = [];
  try {
    log = JSON.parse(await fs.readFile(JSON_STORE, 'utf8'));
    console.log(`ℹ️ Loaded ${log.length} existing records`);
  } catch {
    console.log('ℹ️ No JSON store found, starting fresh');
  }

  // 2) Делаем запрос к Supabase (без несуществующего поля date)
  console.log('⏳ Fetching current tracks from Supabase...');
  const url = `${SUPABASE_URL}/rest/v1/tracks?select=id,artist,title,album&order=id.asc`;
  const res = await fetch(url, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Supabase error ${res.status}: ${err}`);
  }
  const current = await res.json();
  console.log(`✅ Fetched ${current.length} records from Supabase`);

  // 3) Оставляем только новые по id
  const existingIds = new Set(log.map(r => r.id));
  const toAdd = current.filter(r => !existingIds.has(r.id));
  console.log(`🌱 New records to add: ${toAdd.length}`);
  log = log.concat(toAdd);

  // 4) Записываем обновлённый JSON-лог
  await fs.writeFile(JSON_STORE, JSON.stringify(log, null, 2), 'utf8');
  console.log(`💾 Updated ${JSON_STORE}, total: ${log.length}`);

  // 5) Перегенерим HTML-страницы с пагинацией
  const totalPages = Math.ceil(log.length / ITEMS_PER_PAGE);
  for (let page = 1; page <= totalPages; page++) {
    const slice = log.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
    const itemsHtml = slice.map(r =>
      `<li>${r.id}. <strong>${r.artist}</strong> — ${r.title}` +
      (r.album ? ` [${r.album}]` : '') +
      `</li>`
    ).join('\n    ');

    // Навигация
    const nav = [];
    if (page > 1) {
      const prev = page === 2 ? FIRST_PAGE : `${PAGE_PREFIX}${page - 1}.html`;
      nav.push(`<a href="${prev}">← Назад</a>`);
    }
    if (page < totalPages) {
      nav.push(`<a href="${PAGE_PREFIX}${page + 1}.html">Вперёд →</a>`);
    }

    const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8">
  <title>Tracks log — page ${page}/${totalPages}</title>
</head>
<body>
  <ul>
    ${itemsHtml}
  </ul>
  <div>${nav.join(' | ')}</div>
</body>
</html>`;

    const outFile = page === 1 ? FIRST_PAGE : `${PAGE_PREFIX}${page}.html`;
    await fs.writeFile(outFile, html, 'utf8');
    console.log(`✅ ${outFile} (${slice.length} items)`);
  }

  console.log('🎉 All pages regenerated');
})();
