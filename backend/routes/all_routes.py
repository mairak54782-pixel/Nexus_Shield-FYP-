"""
routes/all_routes.py
----------------------
Articles, blogs, and news endpoints - fetches from RSS feeds with a
short-lived MongoDB cache to avoid re-fetching on every request.
"""

import os
import re
from datetime import datetime, timedelta

from fastapi import APIRouter
from pymongo import MongoClient
import feedparser
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

MONGO_URI = os.getenv("MONGO_URI")

try:
    client = MongoClient(MONGO_URI)
    db = client["nexusshield"]
    articles_cache = db["articles_cache"]
    blogs_cache = db["blogs_cache"]
    news_cache = db["news_cache"]
except Exception as e:
    print("MongoDB connection error:", e)


def clean_text(text, max_len=300):
    return re.sub(r"<[^>]+>", "", text)[:max_len]


def extract_image(entry):
    if 'media_content' in entry and entry.media_content:
        return entry.media_content[0].get('url')
    if 'enclosures' in entry and entry.enclosures:
        enc = entry.enclosures[0]
        if 'href' in enc and enc.get('type', '').startswith('image/'):
            return enc['href']
    if 'summary' in entry:
        img = re.search(r'<img[^>]+src="([^">]+)"', entry.summary)
        if img:
            return img.group(1)
    return None


CACHE_EXPIRY_MINUTES = 15


def is_cache_fresh(cache_collection):
    """Check if there's a cached document that is not older than expiry time."""
    cached = cache_collection.find_one({"cache_key": "latest"})
    if cached and "last_updated" in cached:
        age = datetime.utcnow() - cached["last_updated"]
        return age < timedelta(minutes=CACHE_EXPIRY_MINUTES)
    return False


def save_to_cache(cache_collection, data):
    """Save data to cache with current timestamp."""
    cache_collection.update_one(
        {"cache_key": "latest"},
        {"$set": {"data": data, "last_updated": datetime.utcnow()}},
        upsert=True
    )


# ---------- 1. ARTICLES (Educational) ----------
@router.get("/articles")
def get_articles():
    if is_cache_fresh(articles_cache):
        cached = articles_cache.find_one({"cache_key": "latest"})
        return {"articles": cached["data"]}

    rss_urls = [
        "https://www.cisa.gov/cybersecurity-advisories/all.xml",
        "https://www.ncsc.gov.uk/rss/guidance",
    ]
    articles = []
    for url in rss_urls:
        feed = feedparser.parse(url)
        for entry in feed.entries:
            title = entry.title
            desc = clean_text(entry.get("summary", ""))
            if any(kw in (title + desc).lower() for kw in
                   ['how to', 'guide', 'best practice', 'hygiene', 'protect', 'secure', 'tips', 'steps']):
                articles.append({
                    "title": title,
                    "link": entry.link,
                    "description": desc,
                    "pubDate": entry.get("published", datetime.now().strftime("%a, %d %b %Y"))
                })
    if not articles:
        articles = [
            {"title": "How to Create Strong Passwords", "link": "https://www.cisa.gov/passwords",
             "description": "Use 12+ chars, mix of letters, numbers, symbols.",
             "pubDate": datetime.now().strftime("%a, %d %b %Y")},
            {"title": "Enable Two-Factor Authentication", "link": "https://www.cisa.gov/2fa",
             "description": "Blocks 99% of automated attacks.",
             "pubDate": datetime.now().strftime("%a, %d %b %Y")},
            {"title": "Spot Phishing Emails", "link": "https://www.cisa.gov/phishing",
             "description": "Check sender, urgency, grammar.",
             "pubDate": datetime.now().strftime("%a, %d %b %Y")}
        ]
    save_to_cache(articles_cache, articles[:20])
    return {"articles": articles[:20]}


# ---------- 2. BLOGS (Expert opinions) ----------
@router.get("/blogs")
def get_blogs():
    if is_cache_fresh(blogs_cache):
        cached = blogs_cache.find_one({"cache_key": "latest"})
        return {"blogs": cached["data"]}

    rss_urls = [
        "https://krebsonsecurity.com/feed/",
        "https://www.schneier.com/blog/atom.xml",
        "https://security.googleblog.com/feeds/posts/default",
        "https://msrc.microsoft.com/blog/feed/"
    ]
    blogs = []
    for url in rss_urls:
        feed = feedparser.parse(url)
        for entry in feed.entries:
            blogs.append({
                "title": entry.title,
                "link": entry.link,
                "description": clean_text(entry.get("summary", "")),
                "pubDate": entry.get("published", datetime.now().strftime("%a, %d %b %Y")),
                "imageUrl": extract_image(entry)
            })
    if not blogs:
        blogs = [{"title": "Cybersecurity Expert Analysis", "link": "#", "description": "Latest insights",
                   "pubDate": datetime.now().strftime("%a, %d %b %Y")}]
    save_to_cache(blogs_cache, blogs[:20])
    return {"blogs": blogs[:20]}


# ---------- 3. NEWS (Breaches, attacks) ----------
@router.get("/news")
def get_news():
    if is_cache_fresh(news_cache):
        cached = news_cache.find_one({"cache_key": "latest"})
        return {"news": cached["data"]}

    rss_urls = [
        "https://feeds.feedburner.com/TheHackersNews",
        "https://www.bleepingcomputer.com/feed/",
        "https://www.darkreading.com/rss.xml"
    ]
    news_items = []
    incident_keywords = ['breach', 'hack', 'ransomware', 'malware', 'phishing', 'attack', 'data leak',
                          'compromised', 'exposed']
    for url in rss_urls:
        feed = feedparser.parse(url)
        for entry in feed.entries:
            title = entry.title
            desc = clean_text(entry.get("summary", ""))
            if any(kw in (title + desc).lower() for kw in incident_keywords):
                news_items.append({
                    "title": title,
                    "link": entry.link,
                    "description": desc,
                    "pubDate": entry.get("published", datetime.now().strftime("%a, %d %b %Y")),
                    "imageUrl": extract_image(entry),
                    "videoUrl": None
                })
    if not news_items:
        news_items = [{"title": "Recent Data Breaches", "link": "#", "description": "Overview of latest incidents",
                        "pubDate": datetime.now().strftime("%a, %d %b %Y")}]
    save_to_cache(news_cache, news_items[:30])
    return {"news": news_items[:30]}