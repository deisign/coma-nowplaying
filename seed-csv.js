// seed-csv.js — создаёт tracks-log.json из CSV-дампа
const fs = require('fs').promises;
const { parse } = require('csv-parse/sync');
(async () => {
  try {
    const csv = await fs.readFile('tracks_clean.csv', 'utf8');
    // Парсим CSV, ожидаем колонки Title, Artist, Album (регистрозависимо)
    const records = parse(csv, {
      columns: true,
      skip_empty_lines: true,
    }).map((r, i) => ({
      // даём каждому запись уникальный порядковый id
      id: i + 1,
      artist: r.Artist || r.artist,
      title:  r.Title  || r.title,
      album:  r.Album  || r.album || '',
    }));
    // Пишем JSON-файл
    await fs.writeFile('tracks-log.json', JSON.stringify(records, null, 2), 'utf8');
    console.log(`✅ Seeded ${records.length} records to tracks-log.json`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
