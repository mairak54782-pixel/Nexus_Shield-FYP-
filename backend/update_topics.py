"""
update_topics.py
------------------
Periodically refreshes cyber-hygiene training topics from RSS feeds
into MongoDB. Run standalone or on a schedule.
"""

import os
import feedparser
from pymongo import MongoClient
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")

client = MongoClient(MONGO_URI)
db = client["nexusshield"]
collection = db["training_topics"]

rss_urls = [
    "https://www.cisa.gov/news-events/cybersecurity-advisories.xml",
    "https://www.cyber.gov.au/acsc/view-all-content/advisories/rss.xml",
    "https://www.europol.europa.eu/media-press/newsroom/rss-feed/cybercrime"
]


def clean_text(text):
    return text.replace("\n", " ").strip()


def update_topics():
    all_news = []
    for url in rss_urls:
        feed = feedparser.parse(url)
        for entry in feed.entries:
            news_item = {
                "title": entry.title,
                "description": clean_text(entry.get("summary", "")),
                "link": entry.link,
                "pubDate": entry.get("published", str(datetime.now())),
            }
            all_news.append(news_item)

    if all_news:
        collection.delete_many({})
        collection.insert_many(all_news)
        print(f"[{datetime.now()}] ✅ Updated {len(all_news)} topics in MongoDB.")
    else:
        print("⚠️ No new topics found!")


if __name__ == "__main__":
    update_topics()