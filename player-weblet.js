
window.addEventListener("DOMContentLoaded", function () {
  console.log("🔊 Player script started");

  const playerContainer = document.getElementById("nowplaying-player");
  if (!playerContainer) {
    console.error("⛔️ Контейнер #nowplaying-player не знайдено в DOM.");
    return;
  }

  console.log("✅ Плеєр DOM-елемент знайдено");

  playerContainer.innerHTML = `
    <div style="position:fixed; bottom:20px; left:50%; transform:translateX(-50%);
         background: rgba(0,0,0,0.5); backdrop-filter: blur(10px);
         border-radius: 1rem; padding: 1rem 2rem; color: white;
         display: flex; align-items: flex-start; z-index:10; gap: 1rem;">

      <img id="artwork" src="" width="64" height="64" style="border-radius:8px; margin-top: 4px;">

      <div style="line-height: 1.4;">
        <div id="title" style="font-weight: bold;">Loading...</div>
        <div id="artist" style="opacity: 0.8;">...</div>
        <div id="album" style="opacity: 0.6;">альбом: невідомо</div>
        <div id="tags" style="opacity: 0.6;">жанри: ...</div>
      </div>

      <a id="spotify-link" href="#" target="_blank" style="margin-left:auto; margin-top:0.4rem;" title="Open in Spotify">
        <svg width="32" height="32" viewBox="0 0 168 168" xmlns="http://www.w3.org/2000/svg">
          <path fill="#ffffff" d="M84 0C37.7 0 0 37.7 0 84s37.7 84 84 84 84-37.7 84-84S130.3 0 84 0zm38.7 121.3c-1.3 2-4 2.6-6 1.3-16.4-10-37-12.3-61.4-6.7-2.3.6-4.7-.7-5.3-3s.7-4.7 3-5.3c27.2-6.3 50-3.7 68.5 7.7 2 1.3 2.6 4 1.2 6z"/>
        </svg>
      </a>

      <audio id="audio" autoplay controls style="margin-left: 0.5rem; margin-top: 0.4rem;">
        <source src="https://stream.radio.co/s4360dbc20/listen" type="audio/mpeg">
      </audio>
    </div>
  `;
});
