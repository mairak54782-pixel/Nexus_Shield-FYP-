"""
flashcard.py
-------------
Generates (or fetches cached) flashcards and quizzes for cybersecurity
awareness topics, using Groq's LLM API and MongoDB as a cache/store.
"""

import os
import requests
import json
from pymongo import MongoClient
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"

# --- MongoDB Atlas Connection ---
try:
    client = MongoClient(MONGO_URI)
    db = client["nexusshield"]
    content_collection = db["topics_content"]
    progress_collection = db["progress"]
    print("✅ MongoDB Connected! (Flashcard Mode)")
except Exception as e:
    print(f"❌ MongoDB Failed: {e}")

# 8 Topics per Level
HARDCODED_TOPICS = {
    1: [
        "Phishing Awareness", "Password Security", "Public WiFi Risks",
        "Social Engineering", "Two-Factor Authentication", "Safe Browsing",
        "Mobile App Permissions", "Physical Security"
    ],
    2: [
        "SQL Injection", "Cross-Site Scripting (XSS)", "Man-in-the-Middle",
        "Network Firewalls", "VPN Technology", "Encryption Basics",
        "Brute Force Attacks", "Malware Types"
    ],
    3: [
        "Zero-Day Vulnerabilities", "Ransomware Defense", "Cloud Security",
        "Incident Response", "Penetration Testing", "Ethical Hacking",
        "Digital Forensics", "Dark Web Monitoring"
    ]
}


def get_topic_data(topic_from_frontend, level):
    """Fetch topic data from DB if cached, otherwise generate via Groq and store."""
    try:
        query = {
            "title": {"$regex": f"^{topic_from_frontend.strip()}$", "$options": "i"},
            "level": int(level)
        }

        existing_data = content_collection.find_one(query)
        if existing_data:
            existing_data["_id"] = str(existing_data["_id"])
            return existing_data

        print(f"⚡ Generating NEW content for: {topic_from_frontend}...")

        headers = {
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json"
        }

        prompt = (
            f"Generate a professional JSON for cybersecurity topic '{topic_from_frontend}' level {level}. "
            f"Requirements: EXACTLY 4 flashcards and EXACTLY 3 quizzes. "
            f"Structure: {{"
            f'"title": "{topic_from_frontend}", "level": {level}, '
            f'"flashcards": [{{"question": "...", "answer": "..."}}], '
            f'"quizzes": [{{"question": "...", "options": ["A", "B", "C", "D"], "correct_answer": "..."}}]}}'
            f"Return ONLY raw JSON."
        )

        payload = {
            "model": "llama-3.3-70b-versatile",
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.6,
            "response_format": {"type": "json_object"}
        }

        response = requests.post(GROQ_URL, headers=headers, json=payload)
        result = response.json()

        if "choices" not in result:
            print(f"❌ Groq Error: {result}")
            return None

        raw_content = result['choices'][0]['message']['content']
        data = json.loads(raw_content)

        if "flashcards" not in data or not isinstance(data["flashcards"], list):
            data["flashcards"] = []
        if "quizzes" not in data or not isinstance(data["quizzes"], list):
            data["quizzes"] = []

        data["createdAt"] = datetime.utcnow()
        inserted_res = content_collection.insert_one(data.copy())
        data["_id"] = str(inserted_res.inserted_id)
        return data

    except Exception as e:
        print(f"🔥 Error for {topic_from_frontend}: {str(e)}")
        return None


def seed_all_topics():
    """Populate MongoDB with generated content for every hardcoded topic."""
    count = 0
    for level, topics in HARDCODED_TOPICS.items():
        for topic in topics:
            result = get_topic_data(topic, level)
            if result and len(result.get("flashcards", [])) > 0:
                count += 1
    return f"Successfully seeded {count} topics!"


def save_user_quiz_score(user_id, topic_title, score):
    """Save a user's quiz score/progress."""
    try:
        progress_collection.update_one(
            {"user_id": user_id, "topic": topic_title},
            {"$set": {"score": score, "updatedAt": datetime.utcnow()}},
            upsert=True
        )
        return True
    except Exception as e:
        print(f"❌ Error saving progress: {e}")
        return False