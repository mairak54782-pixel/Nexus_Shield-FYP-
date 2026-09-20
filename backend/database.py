"""
database.py
-------------
MongoDB connection. The connection string must come from the MONGO_URI
environment variable - never hardcode credentials here.
"""

import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")

try:
    if not MONGO_URI:
        raise ValueError("MONGO_URI is not set. Add it to your .env file.")

    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    client.admin.command("ping")

    db = client["nexusshield"]
    users_collection = db["users"]
    print("✅ MongoDB connected successfully")

except Exception as e:
    print(f"❌ MongoDB connection error: {e}")
    db = None
    users_collection = None