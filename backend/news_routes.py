"""
news_routes.py
----------------
Cybersecurity news endpoint. Fetches from RSS-to-JSON feeds, de-duplicates
by link via a unique index, and serves the stored items from MongoDB.
"""

import os
import re
from datetime import datetime
import requests

from fastapi import APIRouter, BackgroundTasks
from pymongo import MongoClient, ASCENDING
from dotenv import load_dotenv

load_dotenv()

# ---------- CONFIG ----------
MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("DB_NAME", "nexusshield")
RSS_FEEDS = [
    "https://api.rss2json.com/v1/api.json?rss_url=https://feeds.feedburner.com/TheHackersNews",
    "https://api.rss2json.com/v1/api.json?rss_url=https://www.darkreading.com/rss.xml",
    "https://api.rss2json.com/v1/api.json?rss_url=https://www.bleepingcomputer.com/feed/",
]
MAX_DESCRIPTION_LEN = 200
# ----------------------------

router = APIRouter()

client = MongoClient(MONGO_URI)
db = client[DB_NAME]
news_col = db["news"]

# Unique index on link prevents duplicate stories
try:
    news_col.create_index([("link", ASCENDING)], unique=True, background=True)
except Exception:
    pass


def _clean_item(item: dict) -> dict:
    """Return a lightweight doc with only the fields the app needs."""
    title = (item.get("title") or "").strip()
    link = item.get("link")
    description = item.get("description") or ""

    desc_text = re.sub(r"<[^>]+>", "", description).replace("\n", " ").strip()
    if len(desc_text) > MAX_DESCRIPTION_LEN:
        desc_text = desc_text[:MAX_DESCRIPTION_LEN].rsplit(" ", 1)[0] + "..."

    return {
        "title": title,
        "link": link,
        "description": desc_text,
        "pubDate": item.get("pubDate") or None,
        "created_at": datetime.utcnow(),
    }


def fetch_and_store_new_news():
    """Fetch from feeds and insert only new links (unique index blocks duplicates)."""
    for feed in RSS_FEEDS:
        try:
            resp = requests.get(feed, timeout=12)
            data = resp.json()
            items = data.get("items", []) if isinstance(data, dict) else []
            for item in items:
                link = item.get("link")
                title = (item.get("title") or "").strip()
                if not link or not title:
                    continue
                try:
                    news_col.insert_one(_clean_item(item))
                except Exception:
                    # duplicate key -> already stored, skip
                    pass
        except Exception as e:
            print(f"[news_routes] error fetching {feed}: {e}")


@router.get("/api/news")
def get_news(background_tasks: BackgroundTasks, limit: int = 50):
    """Return latest stored news and refresh the store in the background."""
    background_tasks.add_task(fetch_and_store_new_news)

    docs = list(
        news_col.find(
            {}, {"_id": 0, "title": 1, "link": 1, "description": 1, "pubDate": 1}
        )
        .sort("created_at", -1)
        .limit(int(limit))
    )
    return {"news": docs}