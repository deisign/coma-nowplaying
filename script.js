document.addEventListener("DOMContentLoaded", async () => {
    const container = document.getElementById("now-playing-container");
    const apiUrl = "https://public.radio.co/stations/s4360dbc20/history";
    const streamUrl = "https://stream.radio.co/s4360dbc20/listen";

    let currentTrack = null;
    let audioElement = null;

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

    function fadeOutIn(element, newContent) {
        element.style.opacity = 0;
        setTimeout(() => {
            element.innerHTML = newContent;
            element.style.opacity = 1;
        }, 500);
    }

    async function updateNowPlaying() {
        const track = await fetchNowPlaying();

        if (track) {
            const parsed = parseTrackTitle(track.title);
            console.log("🎵 Обновляем HTML: Трек -", parsed.title, "от", parsed.artist);

            if (!audioElement) {
                audioElement = document.createElement("audio");
                audioElement.controls = true;
                audioElement.src = streamUrl;
                audioElement.autoplay = true;
                audioElement.style.width = "100%";
            }

            if (currentTrack !== parsed.title) {
                fadeOutIn(container, `
                    <div class="now-playing">
                        <img src="${track.artwork_url || 'https://via.placeholder.com/100'}" alt="Обложка альбома">
                        <div class="track-info">
                            <h3>${parsed.title}</h3>
                            <p>${parsed.artist}</p>
                        </div>
                    </div>
                `);

                if (!container.querySelector("audio")) {
                    container.appendChild(audioElement);
                }

                currentTrack = parsed.title;
            }
        }
    }

    updateNowPlaying();
    setInterval(updateNowPlaying, 1000);
});
