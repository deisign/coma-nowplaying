
import requests
from bs4 import BeautifulSoup
import pandas as pd
from datetime import datetime
import os

URL = "https://onlineradiobox.com/ua/coma/playlist/?cs=ua.coma"
HEADERS = {"User-Agent": "Mozilla/5.0"}

def fetch_tracks():
    response = requests.get(URL, headers=HEADERS)
    soup = BeautifulSoup(response.content, "html.parser")
    track_rows = soup.select("table.pls tbody tr")

    data = []
    for row in track_rows:
        cols = row.find_all("td")
        if len(cols) >= 2:
            time_text = cols[0].get_text(strip=True)
            track_text = cols[1].get_text(strip=True)

            if " – " in track_text:
                artist, title = map(str.strip, track_text.split(" – ", 1))
            else:
                artist, title = "", track_text.strip()

            try:
                time_obj = datetime.strptime(time_text, "%H:%M")
                timestamp = datetime.now().replace(hour=time_obj.hour, minute=time_obj.minute, second=0, microsecond=0)
            except Exception:
                timestamp = datetime.now()

            data.append({
                "timestamp": timestamp.isoformat(),
                "artist": artist,
                "title": title
            })

    return pd.DataFrame(data)

if __name__ == "__main__":
    df = fetch_tracks()

    os.makedirs("data", exist_ok=True)
    csv_path = "data/tracks.csv"

    if os.path.exists(csv_path):
        df_old = pd.read_csv(csv_path)
        df = pd.concat([df_old, df]).drop_duplicates(subset=["timestamp", "artist", "title"])

    df.sort_values(by="timestamp").to_csv(csv_path, index=False)
    print(f"Saved {len(df)} total tracks to {csv_path}")
