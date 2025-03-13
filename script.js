// Обновлено 2025-03-13 v11 - фикс обложки и прозрачной кнопки Spotify

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

    // Проверяем, есть ли уже контейнер, если нет – создаём
    let nowPlayingContainer = document.querySelector(".now-playing-container");
    if (!nowPlayingContainer) {
        nowPlayingContainer = document.createElement("div");
        nowPlayingContainer.className = "now-playing-container";
        container.appendChild(nowPlayingContainer);
    }

    nowPlayingContainer.innerHTML = `
        <div class="now-playing">
            <img class="album-art" src="" alt="Обложка альбома">
            <div class="track-info">
                <h3 class="track-title">Загрузка...</h3>
                <p class="track-artist">Загрузка...</p>
                <a href="#" target="_blank" class="spotify-button">
                    <div class="spotify-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 496 512">
                            <path fill="currentColor" d="M248 8C111 8 0 119 0 256s111 248 248 248 248-111 248-248S385 8 248 8zm101 365c-3 5-8 8-13 8-2 0-5-1-7-2-39-24-85-37-132-37-28 0-57 4-84 13-6 2-12 1-16-4s-5-11-2-17c4-5 10-8 16-6 30-9 61-14 91-14 52 0 102 14 146 41 5 3 7 9 6 15s-5 10-9 12zm20-47c-4 7-11 10-18 6-45-28-97-42-150-42-33 0-65 5-95 14-7 2-14-2-16-9-3-7 1-14 8-16 33-10 68-15 103-15 58 0 115 16 164 46 6 4 8 12 4 18zm8-51c-54-32-116-49-180-49-36 0-73 5-108 16-8 2-16-2-18-10-3-8 2-16 10-19 38-11 78-17 116-17 70 0 138 18 197 52 7 4 10 14 6 21-5 8-15 10-23 6z"/>
                        </svg>
                    </div>
                </a>
            </div>
        </div>
    `;

    // Вставляем плеер, если его ещё нет
    if (!nowPlayingContainer.querySelector("audio")) {
        nowPlayingContainer.appendChild(audioElement);
    }

    function getHighResArtwork(url) {
        if (!url) return "https://via.placeholder.com/500"; // Фоллбек, если нет обложки
        return url.replace(/100x100bb/, "1000x1000bb").replace(/source\/100x100/, "source/1000x100");
    }

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

            // Обновляем содержимое карточки без пересоздания
            nowPlayingContainer.querySelector(".album-art").src = getHighResArtwork(track.artwork_url);
            nowPlayingContainer.querySelector(".track-title").textContent = parsed.title;
            nowPlayingContainer.querySelector(".track-artist").textContent = parsed.artist;
            nowPlayingContainer.querySelector(".spotify-button").href = spotifyLink;

            currentTrack = parsed.title;
        }
    }

    updateNowPlaying();
    setInterval(updateNowPlaying, 1000);
});
