document.addEventListener("DOMContentLoaded", async () => {
    const container = document.getElementById("now-playing-container");
    const apiUrl = "https://public.radio.co/stations/s4360dbc20/history";
    const streamUrl = "https://stream.radio.co/s4360dbc20/listen";

    console.log("🚀 Веблет Now Playing запущен!");
    console.log("🔗 Запрашиваем данные с API:", apiUrl);

    async function fetchNowPlaying() {
        try {
            console.time("⏳ Время отклика API");

            const response = await fetch(apiUrl, {
                method: "GET",
                headers: {
                    "Accept": "application/json",
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
                }
            });

            console.timeEnd("⏳ Время отклика API");
            console.log("📡 HTTP-статус ответа:", response.status);

            if (!response.ok) {
                throw new Error(`❌ Ошибка HTTP: ${response.status} - ${response.statusText}`);
            }

            const data = await response.json();
            console.log("✅ API вернуло данные:", data);

            if (!data.tracks || data.tracks.length === 0) {
                console.warn("⚠️ API вернуло пустой массив треков.");
                return null;
            }

            const nowPlayingTrack = data.tracks[0]; // Берем первый трек
            console.log("🎵 Первый трек:", nowPlayingTrack);

            return nowPlayingTrack;

        } catch (error) {
            console.error("❌ Ошибка при получении данных:", error);
            container.innerHTML = `<p style="color: red;">Ошибка загрузки трека.</p>`;
            return null;
        }
    }

    async function updateNowPlaying() {
        console.log("🔄 Обновляем информацию о треке...");
        const track = await fetchNowPlaying();

        if (track) {
            console.log("🎵 Обновляем HTML: Трек -", track.title, "от", track.artist);
            console.log("🖼 Обложка альбома:", track.artwork_url);
            console.log("🔊 Ссылка на радио:", streamUrl);

            container.innerHTML = `
                <div class="now-playing">
                    <img src="${track.artwork_url || 'https://via.placeholder.com/100'}" alt="Обложка альбома">
                    <div class="track-info">
                        <h3>${track.title || 'Неизвестный трек'}</h3>
                        <p>${track.artist || 'Неизвестный исполнитель'}</p>
                        <audio controls src="${streamUrl}" autoplay></audio>
                    </div>
                </div>
            `;

            console.log("✅ Контейнер обновлен.");
        } else {
            console.warn("⚠️ Данных о треке нет. Возможно, сейчас ничего не играет.");
            container.innerHTML = `<p style="color: yellow;">Нет активного трека.</p>`;
        }
    }

    updateNowPlaying();
    setInterval(updateNowPlaying, 30000);
});
