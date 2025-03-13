document.addEventListener("DOMContentLoaded", async () => {
    const container = document.getElementById("now-playing-container");
    const apiUrl = "https://public.radio.co/stations/s4360dbc20/history";
    const streamUrl = "https://stream.radio.co/s4360dbc20/listen";

    let currentTrack = null;
    let audioElement = document.createElement("audio");

    // Создаём плеер один раз
    audioElement.controls = true;
    audioElement.src = streamUrl;
    audioElement.autoplay = true;
    audioElement.style.width = "100%";

    console.log("🚀 Веблет Now Playing запущен!");
    console.log("🔗 Запрашиваем данные с API:", apiUrl);

    async function fetchNowPlaying() {
        try {
            const response = await fetch(apiUrl, {
                method: "GET",
                headers: {
                    "Accept": "application/json",
                    "User-Agent": "Mozilla/5.0"
                }
            });

            if (!response.ok) {
                throw new Error(`❌ Ошибка HTTP: ${response.status}`);
            }

            const data = await response.json();
            console.log("✅ API вернуло данные:", data);

            if (!data.tracks || data.tracks.length === 0) {
                return null;
            }

            return data.tracks[0];

        } catch (error) {
            console.error("❌ Ошибка при получении данных:", error);
            return null;
        }
    }

    function parseTrackTitle(title) {
        if (!title.includes(" - ")) return { artist: "Неизвестный исполнитель", title };
        const [artist, track] = title.split(" - ", 2);
        return { artist, title: track };
    }

    function getSpotifySearchLink(artist, track) {
        const query = encodeURIComponent(`${artist} ${track}`);
        return `https://open.spotify.com/search/${query}`;
    }

    async function updateNowPlaying() {
        const track = await fetchNowPlaying();

        if (track) {
            const parsed = parseTrackTitle(track.title);
            console.log("🎵 Обновляем HTML: Трек -", parsed.title, "от", parsed.artist);

            const spotifyLink = getSpotifySearchLink(parsed.artist, parsed.title);

            // Проверяем, существует ли контейнер, чтобы не дублировать
            let nowPlayingContainer = document.querySelector(".now-playing-container");
            if (!nowPlayingContainer) {
                nowPlayingContainer = document.createElement("div");
                nowPlayingContainer.className = "now-playing-container";
                container.appendChild(nowPlayingContainer);
            }

            nowPlayingContainer.innerHTML = `
                <div class="now-playing">
                    <img class="album-art" src="${track.artwork_url || 'https://via.placeholder.com/150'}" alt="Обложка альбома">
                    <div class="track-info">
                        <h3>${parsed.title}</h3>
                        <p>${parsed.artist}</p>
                        <a href="${spotifyLink}" target="_blank" class="spotify-button">🔎 Найти в Spotify</a>
                    </div>
                </div>
            `;

            // Добавляем аудиоплеер, если он ещё не вставлен
            if (!nowPlayingContainer.querySelector("audio")) {
                nowPlayingContainer.appendChild(audioElement);
            }

            currentTrack = parsed.title;
        }
    }

    updateNowPlaying();
    setInterval(updateNowPlaying, 1000);
});
