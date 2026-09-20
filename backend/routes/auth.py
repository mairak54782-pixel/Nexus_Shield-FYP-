"""
routes/auth.py
----------------
Signup, login, and Google login endpoints.

Note: passwords are currently stored as provided. For production this should
be replaced with hashing (e.g. passlib's pbkdf2_sha256, which is already a
dependency) before any real user data is handled.
"""

from fastapi import APIRouter
from database import db

router = APIRouter()


@router.post("/signup")
async def signup(user: dict):
    """Register a new user with email + password."""
    name = user["name"]
    email = user["email"]
    password = user["password"]

    if db.users.find_one({"email": email}):
        return {"message": "Email already registered"}

    db.users.insert_one({"name": name, "email": email, "password": password})
    return {"message": "User registered successfully"}


@router.post("/login")
async def login(user: dict):
    """Authenticate an existing user."""
    email = user["email"]
    password = user["password"]

    existing_user = db.users.find_one({"email": email, "password": password})
    if not existing_user:
        return {"message": "Invalid email or password"}

    return {
        "message": "Login successful",
        "user": {"name": existing_user["name"], "email": existing_user["email"]},
    }


@router.post("/google-login")
async def google_login(user: dict):
    """Create the user record on first Google sign-in, then log them in."""
    name = user.get("name")
    email = user.get("email")
    users_collection = db["users"]

    if not users_collection.find_one({"email": email}):
        users_collection.insert_one({
            "name": name,
            "email": email,
            "auth_provider": "google",
        })

    return {
        "message": "Google login successful",
        "user": {"name": name, "email": email},
    }