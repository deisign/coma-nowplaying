// generate-csv-pages.js
// Скрипт для генерации пагинированного лога из CSV (по 2000 записей на страницу)
// Установи: npm install csv-parse

const fs = require('fs').promises;
const path = require('path');
const { parse } = require('csv-parse/sync');

// Настройки
const CSV_FILE       = path.resolve(__dirname, 'tracks_clean.csv'); // очищенный CSV
const ITEMS_PER_PAGE = 2000;                                       // 2000 записей на страницу
const PAGE_PREFIX    = 'tracks-log-page';
const FIRST_PAGE     = 'tracks-log.html';

(async () => {
  try {
    // 1) Читаем CSV
    const csvContent = await fs.readFile(CSV_FILE, 'utf8');
    const rawRecords = parse(csvContent, { columns: true, skip_empty_lines: true });
    
    // Нормализуем поля (учитываем заголовки CSV)
    const records = rawRecords.map(r => ({
      id:     r.id     ?? r.ID   ?? r.Id,
      artist: r.Artist ?? r.artist,
      title:  r.Title  ?? r.title,
      album:  r.Album  ?? r.album,
      date:   r.Date   ?? r.date
    }));
    console.log(`🎶 Loaded ${records.length} records from CSV`);

    // 2) Вычисляем количество страниц
    const totalPages = Math.ceil(records.length / ITEMS_PER_PAGE);

    // 3) Генерируем HTML по страницам
    for (let page = 1; page <= totalPages; page++) {
      const start = (page - 1) * ITEMS_PER_PAGE;
      const slice = records.slice(start, start + ITEMS_PER_PAGE);

      // Формируем список <li>
      const itemsHtml = slice.map(r => {
        let line = `<li>`;
        if (r.id)     line += `${r.id}. `;
        line += `<strong>${r.artist}</strong> — ${r.title}`;
        if (r.album)  line += ` [${r.album}]`;
        if (r.date)   line += ` (${r.date})`;
        line += `</li>`;
        return line;
      }).join('\n    ');

      // Навигация
      const nav = [];
      if (page > 1) {
        const prev = page === 2 ? FIRST_PAGE : `${PAGE_PREFIX}${page-1}.html`;
        nav.push(`<a href="${prev}">← Назад</a>`);
      }
      if (page < totalPages) {
        nav.push(`<a href="${PAGE_PREFIX}${page+1}.html">Вперёд →</a>`);
      }

      // Составляем HTML страницы
      const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Tracks log — page ${page}/${totalPages}</title></head>
<body>
  <ul>
    ${itemsHtml}
  </ul>
  <div>${nav.join(' | ')}</div>
</body>
</html>`;

      // Пишем файл
      const outFile = page === 1 ? FIRST_PAGE : `${PAGE_PREFIX}${page}.html`;
      await fs.writeFile(outFile, html, 'utf8');
      console.log(`✅ Generated ${outFile} (${slice.length} items)`);
    }

    console.log('🎉 All pages generated');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
