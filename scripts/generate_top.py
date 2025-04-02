
import pandas as pd
import json
from datetime import datetime, timedelta
import os

INPUT_FILE = "data/tracks.csv"
OUTPUT_FILE = "data/top.json"

def load_tracks():
    df = pd.read_csv(INPUT_FILE, parse_dates=["timestamp"])
    return df

def filter_by_period(df, days):
    cutoff = datetime.now() - timedelta(days=days)
    return df[df["timestamp"] >= cutoff]

def compute_top(df, top_n=10):
    grouped = df.groupby(["artist", "title"]).size().reset_index(name="count")
    top = grouped.sort_values(by="count", ascending=False).head(top_n)
    return top.to_dict(orient="records")

def build_top_json(df):
    return {
        "week": compute_top(filter_by_period(df, 7)),
        "month": compute_top(filter_by_period(df, 30)),
        "year": compute_top(filter_by_period(df, 365))
    }

if __name__ == "__main__":
    if not os.path.exists(INPUT_FILE):
        print(f"Missing file: {INPUT_FILE} — nothing to do.")
        exit(0)

    df = load_tracks()
    top_data = build_top_json(df)

    os.makedirs("data", exist_ok=True)
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(top_data, f, ensure_ascii=False, indent=2)

    print(f"Top chart saved to {OUTPUT_FILE}")
