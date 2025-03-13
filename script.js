document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("now-playing-container");
    const apiUrl = "https://public.radio.co/stations/s4360dbc20/history";
    const streamUrl = "https://stream.radio.co/s4360dbc20/listen";

    async function fetchNowPlaying() {
        try {
            const response = await fetch(apiUrl);
            const data = await response.json();
            return data[0];
        } catch (error) {
            console.error("Ошибка при получении данных о треке:", error);
            return null;
        }
    }

    async function updateNowPlaying() {
        const track = await fetchNowPlaying();
        if (track) {
            container.innerHTML = `
                <div class="now-playing">
                    <img src="${track.artwork || 'https://via.placeholder.com/100'}" alt="Обложка альбома">
                    <div class="track-info">
                        <h3>${track.title}</h3>
                        <p>${track.artist}</p>
                        <audio controls src="${streamUrl}" autoplay></audio>
                    </div>
                </div>
            `;
        }
    }

    updateNowPlaying();
    setInterval(updateNowPlaying, 30000);
});