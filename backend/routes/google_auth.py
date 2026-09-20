# from fastapi import APIRouter, Request
# from fastapi.responses import RedirectResponse
# from dotenv import load_dotenv
# import os
# import requests

# load_dotenv()

# router = APIRouter()

# CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
# CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
# REDIRECT_URI = os.getenv("REDIRECT_URI")

# @router.get("/login/google")
# def login_google():
#     google_auth_endpoint = "https://accounts.google.com/o/oauth2/auth"
#     response_type = "code"
#     scope = "openid email profile"
#     redirect_url = (
#         f"{google_auth_endpoint}?response_type={response_type}"
#         f"&client_id={CLIENT_ID}"
#         f"&redirect_uri={REDIRECT_URI}"
#         f"&scope={scope}"
#     )
#     return RedirectResponse(url=redirect_url)

# @router.get("/google/callback")
# def google_callback(code: str):
#     token_endpoint = "https://oauth2.googleapis.com/token"
#     token_data = {
#         "code": code,
#         "client_id": CLIENT_ID,
#         "client_secret": CLIENT_SECRET,
#         "redirect_uri": REDIRECT_URI,
#         "grant_type": "authorization_code",
#     }

#     token_response = requests.post(token_endpoint, data=token_data)
#     token_json = token_response.json()
#     return token_json
from fastapi import APIRouter, Request
import requests
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter(prefix="/auth/google", tags=["GoogleAuth"])

CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
REDIRECT_URI = os.getenv("REDIRECT_URI")


@router.get("/login")
def google_login():
    google_auth_endpoint = (
        "https://accounts.google.com/o/oauth2/v2/auth"
        "?response_type=code"
        f"&client_id={CLIENT_ID}"
        f"&redirect_uri={REDIRECT_URI}"
        "&scope=openid%20email%20profile"
    )
    return {"auth_url": google_auth_endpoint}


@router.get("/callback")
def google_callback(code: str):
    token_url = "https://oauth2.googleapis.com/token"
    data = {
        "code": code,
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET,
        "redirect_uri": REDIRECT_URI,
        "grant_type": "authorization_code",
    }

    response = requests.post(token_url, data=data)
    token_data = response.json()

    return {"access_token": token_data}
