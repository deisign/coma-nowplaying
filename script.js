document.addEventListener("DOMContentLoaded", async () => {
    const container = document.getElementById("now-playing-container");
    const apiUrl = "https://public.radio.co/stations/s4360dbc20/history";
    const streamUrl = "https://stream.radio.co/s4360dbc20/listen";

    console.log("🚀 Веблет Now Playing запущен!");
    console.log("🔗 Запрашиваем данные с API:", apiUrl);

    async function fetchNowPlaying() {
        try {
            console.time("⏳ Время отклика API"); // Засекаем время запроса

            const response = await fetch(apiUrl);
            
            console.timeEnd("⏳ Время отклика API"); // Логируем задержку запроса

            console.log("📡 HTTP-статус ответа:", response.status);

            if (!response.ok) {
                throw new Error(`❌ Ошибка HTTP: ${response.status} - ${response.statusText}`);
            }

            const data = await response.json();
            console.log("✅ API вернуло данные:", data);

            return data[0]; // Первый трек — текущий
        } catch (error) {
            console.error("❌ Ошибка при получении данных:", error);

            if (error.message.includes("Failed to fetch")) {
                console.warn("⚠️ Возможно, проблема с CORS или API блокирует запросы.");
            }

            container.innerHTML = `<p style="color: red;">Ошибка загрузки трека.</p>`;
            return null;
        }
    }

    async function updateNowPlaying() {
        console.log("🔄 Обновляем информацию о треке...");
        const track = await fetchNowPlaying();

        if (track) {
            console.log("🎵 Сейчас играет:", track.title, "от", track.artist);
            container.innerHTML = `
                <div class="now-playing">
                    <img src="${track.artwork || 'https://via.placeholder.com/100'}" alt="Обложка альбома">
                    <div class="track-info">
                        <h3>${track.title || 'Неизвестный трек'}</h3>
                        <p>${track.artist || 'Неизвестный исполнитель'}</p>
                        <audio controls src="${streamUrl}" autoplay></audio>
                    </div>
                </div>
            `;
        } else {
            console.warn("⚠️ Данных о треке нет.");
        }
    }

    updateNowPlaying();
    setInterval(updateNowPlaying, 30000);
});
