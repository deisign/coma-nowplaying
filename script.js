document.addEventListener("DOMContentLoaded", async () => {
    const container = document.getElementById("now-playing-container");
    const apiUrl = "https://public.radio.co/stations/s4360dbc20/history";
    const streamUrl = "https://stream.radio.co/s4360dbc20/listen";

    let currentTrack = null; // Запоминаем текущий трек
    let audioElement = null; // Отдельно храним плеер, чтобы не сбрасывался

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
            console.log("🎵 Сейчас играет:", nowPlayingTrack);

            return nowPlayingTrack;

        } catch (error) {
            console.error("❌ Ошибка при получении данных:", error);
            container.innerHTML = `<p style="color: red;">Ошибка загрузки трека.</p>`;
            return null;
        }
    }

    function parseTrackTitle(title) {
        if (!title.includes(" - ")) return { artist: "Неизвестный исполнитель", title };
        const [artist, track] = title.split(" - ", 2);
        return { artist, title: track };
    }

    async function updateNowPlaying() {
        console.log("🔄 Обновляем информацию о треке...");
        const track = await fetchNowPlaying();

        if (track) {
            const parsed = parseTrackTitle(track.title);

            console.log("🎵 Обновляем HTML: Трек -", parsed.title, "от", parsed.artist);
            console.log("🖼 Обложка альбома:", track.artwork_url);

            // Если плеер еще не создан – создаем его
            if (!audioElement) {
                audioElement = document.createElement("audio");
                audioElement.controls = true;
                audioElement.src = streamUrl;
                audioElement.autoplay = true;
                audioElement.style.width = "100%"; // Растягиваем плеер по ширине
            }

            // Обновляем только текст и картинку, не трогая плеер
            container.innerHTML = `
                <div class="now-playing">
                    <img src="${track.artwork_url || 'https://via.placeholder.com/100'}" alt="Обложка альбома">
                    <div class="track-info">
                        <h3>${parsed.title || 'Неизвестный трек'}</h3>
                        <p>${parsed.artist || 'Неизвестный исполнитель'}</p>
                    </div>
                </div>
            `;

            // Вставляем плеер в контейнер (но только если его нет)
            if (!container.querySelector("audio")) {
                container.appendChild(audioElement);
            }

            console.log("✅ Контейнер обновлен.");
            currentTrack = parsed.title;
        } else {
            console.warn("⚠️ Данных о треке нет. Возможно, сейчас ничего не играет.");
            container.innerHTML = `<p style="color: yellow;">Нет активного трека.</p>`;
        }
    }

    updateNowPlaying();
    setInterval(updateNowPlaying, 30000);
});
