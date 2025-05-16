const fs = require("fs");
const https = require("https");

const TRACKS_URL = "https://raw.githubusercontent.com/deisign/comafm-parser/main/tracks.json";
const LOG_PATH = "tracks-log.html";

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => resolve(JSON.parse(data)));
    }).on("error", reject);
  });
}

function getCurrentLogEntries() {
  if (!fs.existsSync(LOG_PATH)) return [];
  const html = fs.readFileSync(LOG_PATH, "utf-8");
  const matches = html.matchAll(/<strong>(.*?)<\/strong> — (.*?) \((.*?)\)<\/p>/g);
  return Array.from(matches).map(m => m[0]);
}

function insertTrack(html, line) {
  const marker = "<div id=\"log\">";
  const i = html.indexOf(marker);
  if (i === -1) throw new Error("Log marker not found");
  const insertAt = html.indexOf("</div>", i);
  return html.slice(0, insertAt) + line + "\n" + html.slice(insertAt);
}

async function main() {
  const tracks = await fetchJSON(TRACKS_URL);
  if (!Array.isArray(tracks) || tracks.length === 0) return;

  const latest = tracks[0];
  const { artist, title, program, timestamp } = latest;
  if (!artist || !title) return;

  const dateStr = new Date(timestamp).toISOString().slice(0, 16).replace("T", " ");
  const line = `<p><strong>${artist}</strong> — ${title} (${dateStr}, program: ${program || "Unknown"})</p>`;

  const html = fs.readFileSync(LOG_PATH, "utf-8");
  if (html.includes(line)) return;

  const updated = insertTrack(html, line);
  fs.writeFileSync(LOG_PATH, updated);
}

main().catch(e => { console.error(e); process.exit(1); });
