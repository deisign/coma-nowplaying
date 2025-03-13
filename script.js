document.addEventListener("DOMContentLoaded", async () => {
    const container = document.getElementById("now-playing-container");
    const apiUrl = "https://public.radio.co/stations/s4360dbc20/history";
    const streamUrl = "https://stream.radio.co/s4360dbc20/listen";

    async function fetchNowPlaying() {
        try {
            console.log("Запрос к API:", apiUrl); // Логируем запрос
            const response = await fetch(apiUrl);
            
            if (!response.ok) {
                throw new Error(`Ошибка HTTP: ${response.status}`);
            }

            const data = await response.json();
            console.log("Ответ API:", data); // Логируем ответ

            return data[0]; // Первый элемент массива — текущий трек
        } catch (error) {
            console.error("Ошибка при получении данных о треке:", error);
            container.innerHTML = `<p style="color: red;">Ошибка загрузки трека.</p>`;
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
                        <h3>${track.title || 'Неизвестный трек'}</h3>
                        <p>${track.artist || 'Неизвестный исполнитель'}</p>
                        <audio controls src="${streamUrl}" autoplay></audio>
                    </div>
                </div>
            `;
        }
    }

    updateNowPlaying();
    setInterval(updateNowPlaying, 30000);
});
