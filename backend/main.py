# from fastapi.middleware.cors import CORSMiddleware
# from fastapi.responses import JSONResponse
# from pymongo import MongoClient
# from datetime import datetime
# from pydantic import BaseModel
# import uvicorn
# import firebase_admin
# from firebase_admin import credentials, messaging
# from bson import ObjectId
# import numpy as np  
# from collections import defaultdic
# from ai_model import predict_url
# from flashcard import get_topic_data, save_user_quiz_score, HARDCODED_TOPICS
# from routes.all_routes import router as all_routes_router
# import requests
# from apscheduler.schedulers.background import BackgroundScheduler
# import asyncio
# from fastapi import FastAPI, Request, BackgroundTasks, HTTPException, Query
# from fastapi.responses import JSONResponse
# from bson import ObjectId
# from nudge_engine import DynamicNudgeEngine
# from thompson_engine import ThompsonNudgeEngine
# from passlib.context import CryptContext
# pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")
# cred = credentials.Certificate("firebase-key.json")
# if not firebase_admin._apps:
#     firebase_admin.initialize_app(cred)

# def send_fcm_nudge(token, title, body, category, user_id):
#     # Sirf Data bhejni hai taake Notifee trigger ho
#     message = messaging.Message(
#         data={
#             "title": title,
#             "body": body,
#             "userId": str(user_id),
#             "category": category,
#             "action_type": "nudge_response"
#         },
#         token=token,
#     )
    
#     try:
#         response = messaging.send(message)
#         print(f"🚀 FCM Nudge Sent ({category}):", response)
#         return True
#     except Exception as e:
#         # ✨ NEW: Agar token expire ya delete ho chuka hai (Entity not found)
#         if "Requested entity was not found" in str(e):
#             print(f"🧹 Dead token found for user {user_id}. Removing from DB...")
#             # Ye line database se us ghalat token ko hata degi
#             # db.users.update_one(
#             #     {"_id": ObjectId(user_id)}, 
#             #     {"$unset": {"fcm_token": ""}} 
#             # )
#             users_collection.update_one({"_id": ObjectId(user_id)}, {"$unset": {"fcm_token": ""}})
        
#         print(f"❌ FCM Error details: {e}")
#         return False
# async def check_and_send_scheduled_nudges():
#     print("⏰ Checking for scheduled nudges...")
#     active_users = users_collection.find({"fcm_token": {"$exists": True}})
    
#     for user in active_users:
#         user_id = str(user["_id"])
        
#         # Thompson Engine check (Force=False by default)
#         final_data = thompson_gen.generate_final_nudge(user_id, nudge_gen)

#         if final_data:
#             nudge_to_send = final_data["nudge_content"] # Direct content use karein
#             success = send_fcm_nudge(
#                 token=user["fcm_token"],
#                 title=f"🛡️ Nexus Shield: {nudge_to_send['category']}",
#                 body=nudge_to_send['nudge'],
#                 category=nudge_to_send['category'],
#                 user_id=user_id
#             )
            
#             if success:
               
#                 print(f"🚀 Automated Nudge sent to {user.get('email', 'User')}")
# app = FastAPI()
# scheduler = BackgroundScheduler()


# def run_automation():
#     print("⏰ Checking for scheduled nudges and syncing ignored ones...")
#     thompson_gen.sync_ignored_nudges()
    
#     try:
#         # Check karein agar koi loop pehle se chal raha hai
#         loop = asyncio.get_event_loop()
#     except RuntimeError:
#         # Agar nahi chal raha toh naya banayein
#         loop = asyncio.new_event_loop()
#         asyncio.set_event_loop(loop)
    
#     loop.run_until_complete(check_and_send_scheduled_nudges())
# scheduler.add_job(
#     run_automation,
#     'interval', 
#     minutes=30
# )
# scheduler.start()
# # ✅ Routers
# app.include_router(all_routes_router, prefix="/api")

# class UpdateProfileModel(BaseModel):
#     name: str
#     email: str
# # ✅ MongoDB Connection
# try:
#     client = MongoClient(
#         "mongodb+srv://nexus_user1:4PAiHn%219B%25D.uDM@cluster0.begtxob.mongodb.net/nexusshield?retryWrites=true&w=majority&appName=Cluster0"
#     )
#     db = client["nexusshield"]
#     users_collection = db["users"]
#     quiz_scores_collection = db["quizscores"]
#     progress_collection = db["progress"]
#     trainingdata_collection = db["trainingdata"]
#     db_cyber = client["cyber_training"]
#     topics_collection = db_cyber["topics"]
#     messages_collection = db["messages"]
#     nudge_gen = DynamicNudgeEngine(db)
#     thompson_gen = ThompsonNudgeEngine(db)
#     survey_collection = db["surveys"]
#     category_data_collection = db["categorydata"]
#     print("✅ MongoDB connected successfully!")
# except Exception as e:
#     print("❌ MongoDB connection failed:", e)

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )
# # -----------------------------------------------------------
# # ✅ db of model
# # -----------------------------------------------------------
# @app.get("/test-db")
# def test_connection():
#     try:
#         # Ye line check karti hai ke Atlas ne respond kiya ya nahi
#         client.admin.command('ping')
#         return {"status": "success", "message": "connected sucessfulyy."}
#     except Exception as e:
#         return {"status": "error", "message": f"Connection Fail: {str(e)}"}

# class URLRequest(BaseModel):
#     url: str  
#     user_id: str = None    
#     user_name: str = None

# @app.post("/predict")
# def predict_url_endpoint(data: URLRequest):
#     try:
#         # 1. Sab se pehle link check karo
#         result = predict_url(data.url)
#         label = result.get("label", "UNKNOWN").upper()

#         # data.url aur data.user_id direct use karein (getattr ki zaroorat nahi)
#         user_id = data.user_id 
#         user_name = data.user_name or "Unknown"

#         try:
#             if user_id:
#                 label_upper = label.upper()

#                 # ✅ Sahi Spacing: Ye sara logic 'if user_id' ke andar hona chahiye
#                 if "PHISHING" in label_upper:
#                     update_field = "summary.phishing_count"
#                 elif "UNSAFE" in label_upper or "CAUTION" in label_upper or "PARTIAL" in label_upper:
#                     # "POTENTIALLY UNSAFE" ab yahan count hoga
#                     update_field = "summary.partial_phishing_count"
#                 elif "SAFE" in label_upper:
#                     update_field = "summary.safe_count"
#                 else:
#                     # Default case agar koi match na mile
#                     update_field = "summary.safe_count"

#                 # Database update query (Ye bhi 'if user_id' ke andar rahay gi)
#                 db["stats"].update_one(
#                     {"user_id": user_id},
#                     {
#                         "$set": {"user_name": user_name},
#                         "$inc": {
#                             "summary.total_checked": 1,
#                             update_field: 1
#                         },
#                         "$push": {
#                             "history": {
#                                 "url": data.url, 
#                                 "result": label,
#                                 "timestamp": datetime.utcnow()
#                             }
#                         }
#                     },
#                     upsert=True
#                 )
#                 print(f"📊 Stats updated for {user_name}")

#         except Exception as stats_err:
#             print(f"⚠️ Stats Update Error (Silent): {stats_err}")
#         return result

#     except Exception as e:
#         print(f"❌ Main Error: {e}")
#         return {"label": "❌ ERROR", "error": str(e)}
# # -----------------------------------------------------------
# # ✅ TRAINING & PROGRESS ROUTES
# # -----------------------------------------------------------

# @app.get("/topics/{level}")
# async def get_level_topics(level: int):
#     topics = HARDCODED_TOPICS.get(level, [])
#     if not topics:
#         return JSONResponse({"topics": [], "message": "Level not found"}, status_code=404)
#     return {"topics": topics}

# @app.get("/get-content")
# async def get_content(topic: str, level: int):
#     clean_topic = topic.strip()
#     try:
#         content = get_topic_data(clean_topic, level)
#         if content:
#             return content
#         return JSONResponse(status_code=404, content={"error": "Not found"})
#     except Exception as e:
#         return JSONResponse(status_code=500, content={"error": str(e)})

# @app.post("/api/save-quiz-result")
# async def save_quiz_result(request: Request):
#     try:
#         final_return_avg = 0
#         data = await request.json()
        
#         user_id = data.get("user_id")
#         user_name = data.get("user_name", "Unknown") 
#         new_score = float(data.get("score", 0))
#         total_val = data.get("total", 0)

#         # --- FIX: Fetch Level using _id and ObjectId ---
#         # Screenshot ke mutabiq ID '_id' field mein hai
#         user_profile = db["users"].find_one({"_id": ObjectId(user_id)})
        
#         if user_profile:
#             # Screenshot ke mutabiq: level: 1
#             db_val = user_profile.get("level", 3)
#             # Aapka logic: 1=High, 2=Medium, 3=Low
#             level_map = {1: "High", 2: "Medium", 3: "Low"}
#             display_level = level_map.get(int(db_val), "Low")
#         else:
#             # Agar user nahi mila toh fallback
#             display_level = "Low" 

#         # --- Baqi logic same rahega ---
#         existing_data = db["trainingdata"].find_one({"user_id": user_id})
#         current_percentage = (new_score / total_val) * 100 if total_val > 0 else 0

#         if existing_data:
#             old_avg = float(existing_data.get("quizScore") or 0)
#             old_count = int(existing_data.get("quizzesAttempted") or 0)
            
#             new_count = old_count + 1
#             avg_score = ((old_avg * old_count) + current_percentage) / new_count
#             final_return_avg = avg_score
            
#             # --- UPDATED LOGIC HERE ---
#             # Har 3 quizzes ke baad 1 lesson barhayen
#             lesson_increment = 1 if new_count % 3 == 0 else 0
            
#             db["trainingdata"].update_one(
#                 {"user_id": user_id},
#                 {
#                     "$inc": {
#                         "lessonsCompleted": lesson_increment, 
#                         "quizzesAttempted": 1
#                     }, 
#                     "$set": {
#                         "user_name": user_name,
#                         "level": display_level,
#                         "quizScore": round(avg_score, 2)
#                     }
#                 }
#             )
#         else:
#             final_return_avg = current_percentage
#             db["trainingdata"].update_one(
#                 {"user_id": user_id},
#                 {
#                     "$set": {
#                         "user_id": user_id,
#                         "user_name": user_name,
#                         "level": display_level,
#                         "quizScore": round(current_percentage, 2), 
#                         "quizzesAttempted": 1, 
#                         "lessonsCompleted": 1
#                     }
#                 },
#                 upsert=True
#             )

#         db["quizscores"].insert_one({
#             "user_id": user_id, 
#             "user_name": user_name,
#             "range": f"{int(new_score)}/{total_val}", 
#             "score": new_score,
#             "timestamp": datetime.utcnow()
#         })
        
#         return {"status": "success", "average_score": round(final_return_avg, 2)}

#     except Exception as e:
#         print(f"Error: {e}")
#         return JSONResponse(status_code=500, content={"error": str(e)})
# @app.get("/api/progress/{user_id}") 
# async def get_user_progress(user_id: str):
#     try:
#         # 'progress' ki jagah ab 'trainingdata' se find karega
#         progress_data = db["trainingdata"].find_one({"user_id": user_id}, {"_id": 0})
        
#         if progress_data:
#             return progress_data
            
#         # Agar data nahi milta toh default values
#         return {
#             "lessonsCompleted": 0, 
#             "quizzesAttempted": 0, 
#             "quizScore": 0, 
#             "level": "Low"
#         }
#     except Exception as e:
#         return JSONResponse(status_code=500, content={"error": str(e)})
# # -----------------------------------------------------------
# # ✅ Progress Report
# # -----------------------------------------------------------
# @app.get("/api/progress-stats/{user_id}")
# async def get_progress_stats(user_id: str):
#     try:
#         # Aapne save karte waqt "user_id" key use ki hai, "userId" nahi
#         user_data = db["trainingdata"].find_one({"user_id": user_id})
        
#         if not user_data:
#             return {"lessons": 0, "quizzes": 0, "quizScoreAvg": 0, "level": "Low"}

#         # Save kiye huye fields uthayen
#         lessons = user_data.get("lessonsCompleted", 0)
#         quizzes = user_data.get("quizzesAttempted", 0)
#         avg_score = user_data.get("quizScore", 0)
#         user_level = user_data.get("level", "Low")

#         # Chart ke liye 0 to 1 normalize karein (e.g. 85% -> 0.85)
#         normalized_avg = avg_score / 100

#         return {
#             "lessons": lessons,
#             "quizzes": quizzes,
#             "quizScoreAvg": round(normalized_avg, 2),
#             "level": user_level
#         }
#     except Exception as e:
#         print(f"❌ ERROR: {str(e)}")
#         return {"lessons": 0, "quizzes": 0, "quizScoreAvg": 0, "level": "Low"}
# # -----------------------------------------------------------
# # ✅ AUTHENTICATION
# # -----------------------------------------------------------
# @app.post("/signup")
# #async def signup(request: Request):
# async def signup(request: Request, background_tasks: BackgroundTasks):
#     data = await request.json()
#     email = data.get("email")
#     raw_password = data.get("password")
#     if not raw_password:
#         return JSONResponse({"message": "Password is required"}, status_code=400)

#     # ✅ Fix: Password ko string mein convert karke hash karein
#     # Is se passlib ko "72-byte" wala confusion nahi hoga
#     hashed_password = pwd_context.hash(str(raw_password))
#     if users_collection.find_one({"email": email}):
#         return JSONResponse({"message": "User already exists"}, status_code=400)
    
#     # ✅ 1. Insert karne ke baad result ko variable mein rakhein
#     result = users_collection.insert_one({
#         "name": data.get("name"), 
#         "email": email, 
#         # "password": data.get("password"),
#         "password": hashed_password,
#         "fcm_token": data.get("fcm_token"),
#         "role": data.get("role"), 
#         "createdAt": datetime.utcnow(),
#         "surveyDone": False,
#     })
#     new_user_id = str(result.inserted_id)
#     background_tasks.add_task(trigger_signup_nudge, new_user_id)
#     # ✅ 2. Response mein 'user_id' lazmi bhejein (string mein convert kar ke)
#     return {
#         "message": "User registered successfully",
#         "user_id": str(result.inserted_id) # 👈 Ye line miss thi!
#     }


# @app.post("/login")
# #async def login(request: Request):
# async def login(request: Request, background_tasks: BackgroundTasks):    
#     try:
#         data = await request.json()
#         email = data.get("email")
#         password = data.get("password")
#         fcm_token = data.get("fcm_token")
        
#         # user = users_collection.find_one({"email": email, "password": password})
#         user = users_collection.find_one({"email": email})
#         # if not user:
#         #     return JSONResponse({"message": "Invalid credentials"}, status_code=401)
#         if not user or not pwd_context.verify(password, user.get("password")):
#             return JSONResponse({"message": "Invalid password"}, status_code=401)
#         if fcm_token:
#             users_collection.update_one(
#                 {"_id": user["_id"]},
#                 {"$set": {"fcm_token": fcm_token}}
#             )
#             print(f"✅ FCM Token updated for {email}")

#         # --- CRITICAL FIX FOR NUDGE ENGINE ERROR ---
#         # Agar aapka Nudge Engine background mein level check karta hai,
#         # toh check karein ke level string hai ya nahi.
#         user_level = user.get("level", "Beginner")
        
    
#         level_map = {"Beginner": 1, "Intermediate": 2, "Advanced": 3}
#         # Agar database mein "Intermediate" hai toh ye 2 return karega
#         numeric_level = level_map.get(user_level, 1) 

#         print(f"User Level: {user_level} (Numeric: {numeric_level})")
#         # --- Nudge Trigger Logic (5 Minutes Delay) ---
#         user_id_str = str(user.get("_id"))
#         background_tasks.add_task(trigger_login_nudge, user_id_str)
#         return {
#             "message": "Login successful", 
#             "user": {
#                 "name": user.get("name"), 
#                 "email": user.get("email"),
#                 "user_id": str(user.get("_id")),
#                 "surveyDone": user.get("surveyDone", False),
#                 "level": user_level, 
#                 "level_num": numeric_level 
#             }
#         }
#     except Exception as e:
#         print(f"❌ Login Crash Error: {str(e)}")
#         return JSONResponse({"message": "Server error during login", "error": str(e)}, status_code=500)
# #------------------------------------------------------
# #------------------------------------------------------
# # --- SIGNUP TRIGGER ---
# # --- SIGNUP TRIGGER ---
# async def trigger_signup_nudge(user_id: str):
#     try:
#         # Signup ke foran baad nudge bhejne ke liye 10-60 seconds wait kafi hai
#         await asyncio.sleep(300)  
#         # ✅ FIX: force=True add kiya taake gap check bypass ho jaye
#         nudge =  thompson_gen.generate_final_nudge(user_id, nudge_gen, force=True)
#         if nudge:
#             await execute_nudge_send(user_id, nudge, "🛡️ Welcome to Nexus Shield!")
#     except Exception as e:
#         print(f"⚠️ Signup Nudge Error: {e}")

# # --- LOGIN TRIGGER ---
# async def trigger_login_nudge(user_id: str):
#     try:
#         # Login ke baad testing ke liye 10 seconds wait rakhein
#         await asyncio.sleep(300) 
#         # ✅ FIX: force=True add kiya taake login par lazmi nudge mile
#         nudge = thompson_gen.generate_final_nudge(user_id, nudge_gen, force=True)
#         if nudge:
#             await execute_nudge_send(user_id, nudge, "🛡️ Welcome Back!")
#     except Exception as e:
#         print(f"⚠️ Login Nudge Error: {e}")

# # --- COMMON HELPER ---
# async def execute_nudge_send(user_id, nudge, title):
#     try:
#         # 1. User find karein (ObjectId check ke saath)
#         user = users_collection.find_one({"_id": ObjectId(user_id)})
        
#         if not user:
#             print(f"❌ User {user_id} not found in database.")
#             return
            
#         if "fcm_token" not in user or not user["fcm_token"]:
#             print(f"⚠️ User {user_id} has no FCM token. Skipping...")
#             return

#         # 2. Content format handle karein
#         content = nudge["nudge_content"][0] if isinstance(nudge["nudge_content"], list) else nudge["nudge_content"]

#         # 3. Notification send karein
#         success = send_fcm_nudge(
#             token=user["fcm_token"], 
#             title=title, 
#             body=content['nudge'], 
#             category=content['category'], 
#             user_id=user_id
#         )
        
#         if success:
#             # 4. History save karein
#             db.nudge_history.insert_one({
#                 "userId": user_id,
#                 "nudgeId": nudge["nudgeId"],
#                 "category": content['category'],
#                 "action": "sent",
#                 "timestamp": datetime.utcnow()
#             })
            
#             # 5. Thompson Stats update karein (taake repeat na ho)
#             db.thompson_stats.update_one(
#                 {"userId": user_id},
#                 {"$push": {"sent_nudge_ids": nudge["nudgeId"]}},
#                 upsert=True # Agar stats doc na ho toh create kar dega
#             )
#             print(f"🚀 Nudge sent and tracked for user: {user_id}")
#         else:
#             print(f"❌ FCM Send failed for user: {user_id}")

#     except Exception as e:
#         print(f"🔥 Critical Error in execute_nudge_send: {str(e)}")
#     # -----------------------------------------------------------
# # ✅ Log out
# # -----------------------------------------------------------
# @app.post("/api/logout/{user_id}")
# async def logout(user_id: str):
#     try:
#         # User ka fcm_token delete kar rahe hain taake scheduler usay na pakray
#         result = users_collection.update_one(
#             {"_id": ObjectId(user_id)}, 
#             {"$unset": {"fcm_token": ""}}
#         )
#         if result.modified_count > 0:
#             return {"status": "success", "message": "Logged out and token removed"}
#         return {"status": "error", "message": "User not found or token already gone"}
#     except Exception as e:
#         return {"status": "error", "message": str(e)}
# # -----------------------------------------------------------
# # ✅ profile screeen
# # -----------------------------------------------------------
# @app.get("/api/user/{user_id}")
# async def get_user_profile(user_id: str):
#     user = users_collection.find_one({"_id": ObjectId(user_id)})
#     if user:
#         return {
#             "name": user.get("name"),
#             "email": user.get("email")
#         }
#     raise HTTPException(status_code=404, detail="User not found")

# # 2. User ka data update karne ke liye (Save button par)
# @app.put("/api/update-profile/{user_id}")
# async def update_profile(user_id: str, profile_data: UpdateProfileModel):
#     result = users_collection.update_one(
#         {"_id": ObjectId(user_id)},
#         {"$set": {
#             "name": profile_data.name, 
#             "email": profile_data.email
#         }}
#     )
    
#     if result.matched_count > 0:
#         return {
#             "status": "success", 
#             "message": f"Profile updated! New name: {profile_data.name}"
#         }
#     return {"status": "error", "message": "Update failed"}
# @app.post("/api/report-content")
# async def report_content(data: dict):
#     try:
#         messages_collection.insert_one(data)
#         return {"status": "success", "message": "Report saved!"}
#     except Exception as e:
#         return {"status": "error", "message": str(e)}
# # -----------------------------------------------------------
# # ✅ SAVE SURVEY RESULTS & CALCULATE LEVEL
# # -----------------------------------------------------------
# CATEGORY_MAP = {
#     "T1": "Password Security", "T2": "Device Security", "T3": "Physical Security",
#     "T4": "Network Security", "T5": "Password Security", "T6": "Password Security",
#     "T7": "Software Updates", "T8": "Malware Protection", "S1": "App Security",
#     "S2": "Phishing", "S3": "Web Security", "S4": "Phishing",
#     "S5": "Phishing", "S6": "Device Security"
# }

# @app.post("/survey")
# async def save_survey(request: Request):
#     try:
#         data = await request.json()
#         user_id = data.get("userId")
#         answers = data.get("answers", []) 

#         # --- 1. Fair Statistical Logic ---
#         total_score = sum(a["score"] for a in answers)
#         grouped_data = defaultdict(list)
        
#         # Row format: ["T1 : Password Security : 5", "S2 : Phishing : 4"]
#         descriptive_results = []

#         for a in answers:
#             q_id = a["questionId"]
#             score = a["score"]
#             cat_name = CATEGORY_MAP.get(q_id, "General")
            
#             descriptive_results.append(f"{q_id} : {cat_name} : {score}")
#             grouped_data[cat_name].append(score)

#         # Category Averages (Simple Mean - No Penalty)
#         category_scores = {
#             cat: round(np.mean(scores), 2) 
#             for cat, scores in grouped_data.items()
#         }

#         weak_cats = []
        
#         # Ab har category ke average ko seedha 3.0 se check karein
#         for cat, avg in category_scores.items():
#             if avg < 3.0:
#                 weak_cats.append(cat)
#         # --- 3. Level Calculation ---
#         # --- 2. Level Calculation (Numeric Save) ---
#         percentage = round((total_score / 70) * 100, 2)
        
#         # Strings ke bajaye Numbers use kar rahe hain
#         if percentage >= 75:
#             user_level = 3  # Advanced
#         elif percentage >= 45:
#             user_level = 2  # Intermediate
#         else:
#             user_level = 1  # Beginner

#         # --- 3. Database Structure Update ---
#         formatted_survey = {
#             "userId": str(user_id),
#             "descriptive_results": descriptive_results,
#             "category_scores": category_scores,
#             "weak_categories": weak_cats,
#             "total_score": total_score,
#             "percentage": percentage,
#             "level": user_level,  # Ab ye 1, 2, ya 3 save hoga
#             "timestamp": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
#         } 

#         survey_collection.insert_one(formatted_survey)
        
#         # User profile update
#         users_collection.update_one(
#             {"_id": ObjectId(user_id) if len(user_id) == 24 else user_id},
#             {"$set": {
#                 "surveyDone": True, 
#                 "level": user_level,
#                 "cyber_hygiene_score": percentage
#             }}
#         )

#         return {
#             "status": "success",
#             "level": user_level,
#             "percentage": percentage,
#             "weak_points": weak_cats,
#             "results": descriptive_results
#         }

#     except Exception as e:
#         print(f"DEBUG ERROR: {str(e)}")
#         return JSONResponse(status_code=500, content={"error": str(e)})
#     # -----------------------------------------------------------
# # ✅ categorydata for progress report
# # -----------------------------------------------------------
# @app.get("/api/user-category-report/{user_id}")
# async def get_category_report(user_id: str):
#     try:
#         # Survey se data uthayein
#         survey = db["surveys"].find_one({"userId": user_id}, sort=[("timestamp", -1)])
#         if not survey:
#             return {"error": "Survey not found"}

#         weak_cats = survey.get("weak_categories", [])
        
#         # Level hamesha 'users' collection se uthayein (Integer format mein)
#         user_info = db["users"].find_one({"_id": ObjectId(user_id)})
#         numeric_level = user_info.get("level", 1) if user_info else 1

#         # Nudge history se interactions count karein
#         all_nudges = list(db["nudge_history"].find({"userId": user_id}))

#         # ✨ UPDATED LOGIC ✨
#         # 15 nudges ka target rakhte hain (Taki user ko mehnat karni pare)
#         TARGET_PER_CAT = 15 
#         category_percentages = {}

#         for cat in weak_cats:
#             # Sirf wo count karein jo user ne "mark_as_read" kiye hain
#             read_count = sum(1 for n in all_nudges if n.get("category") == cat and n.get("action") == "mark_as_read")
            
#             # Progress calculation (Slow increase)
#             progress = (read_count / TARGET_PER_CAT) * 100
#             # Isay 100 se ooper nahi janay dena
#             category_percentages[cat] = min(round(progress, 2), 100)

#         # Frontend ke liye status decide karein (Jaisa aapne kaha 50% threshold)
#         # Yeh aap frontend pe bhi kar sakti hain aur yahan status bhej bhi sakti hain
        
#         report_data = {
#             "user_id": user_id,
#             "weak_categories": weak_cats,
#             "nudge_distribution": category_percentages, # Yeh ab 6.6%, 13.3% karke barhega
#             "security_level": numeric_level, # Numeric bhej rahe hain taake crash na ho
#             "updatedAt": datetime.utcnow()
#         }

#         # Database update
#         db["categorydata"].update_one(
#             {"user_id": user_id},
#             {"$set": report_data},
#             upsert=True
#         )

#         return {"status": "success", "data": report_data}

#     except Exception as e:
#         print(f"Report Error: {e}")
#         return {"error": str(e)}
# # -----------------------------------------------------------
# # ✅ REAL-TIME AI NUDGE ENGINE (Thompson Sampling)
# # -----------------------------------------------------------
# @app.get("/api/get-nudge/{user_id}")
# async def get_nudge(user_id: str):
#     try:
#         # 1. 🟢 Ye Engine Async hai, is par await LAZMI hai
#         # Thompson logic results calculate karke layega
#         final_data =  thompson_gen.generate_final_nudge(user_id, nudge_gen)

#         if not final_data:
#             return {"status": "wait", "message": "Not the right time or gap for a nudge."}

#         # 2. 🟡 Ye Database Sync hai, is par await NAHI lagana
#         # Agar yahan await lagaya toh "NoneType" ya "Not awaitable" error ayega
#         user = users_collection.find_one({"_id": ObjectId(user_id)})
        
#         if not user or not user.get("fcm_token"):
#              return {"status": "error", "message": "No FCM token found for user"}

#         # 3. Notification bhejnah (Sync function)
#         nudge_to_send = final_data["nudge_content"][0] 
        
#         notification_sent = send_fcm_nudge(
#             token=user.get("fcm_token"),
#             title=f"🛡️ Security Alert: {nudge_to_send['category']}",
#             body=nudge_to_send['nudge'],
#             category=nudge_to_send['category'],
#             user_id=user_id
#         )

#         # 4. 🟡 History save karna (Sync call, No await)
#         if notification_sent:
#             db.nudge_history.insert_one({
#                 "userId": user_id,
#                 "category": nudge_to_send['category'],
#                 "nudge": nudge_to_send['nudge'],
#                 "combo": final_data["combo_metadata"],
#                 "timestamp": datetime.utcnow(),
#                 "action": "sent"
#             })

#         return {
#             "status": "success",
#             "nudge": nudge_to_send['nudge']
#         }

#     except Exception as e:
#         # Traceback print karein taake exact line pata chale agar phir error aaye
#         import traceback
#         traceback.print_exc()
#         print(f"❌ Nudge Engine Error: {e}")
#         return {"status": "error", "message": str(e)}
# #----------------------------------------------
# #-------get interaction-------
# @app.post("/api/nudge-interaction")
# async def nudge_interaction(request: Request):
#     try:
#         data = await request.json()
#         user_id = data.get("userId")
#         action = data.get("action") 
        
#         # 1. MongoDB se sahi field (timestamp_sent) se fetch karein
#         last_nudge = db.nudge_history.find_one(
#             {"userId": user_id}, 
#             sort=[("timestamp_sent", -1)] # 👈 Yahan 'timestamp' ki jagah 'timestamp_sent' kiya
#         )
        
#         if last_nudge and "combo" in last_nudge:
#             # 2. Thompson logic update (Sync function hai toh await hata dein)
#             thompson_gen.update_user_behavior(user_id, last_nudge["combo"], action)
            
#             # 3. History update (is_processed aur timestamp_action ke saath)
#             db.nudge_history.update_one(
#                 {"_id": last_nudge["_id"]},
#                 {"$set": {
#                     "action": action, 
#                     "timestamp_action": datetime.utcnow(), # 👈 Null khatam ho jayega
#                     "is_processed": True                  # 👈 False ab True ho jayega
#                 }}
#             )

#         # --- Baaki Survey wala logic (Niche wala) ---
#         survey = db["surveys"].find_one({"userId": user_id}, sort=[("timestamp", -1)])
        
#         if survey:
#             weak_cats = survey.get("weak_categories", [])
#             numeric_level = survey.get("level", 1)
            
#             # Level Mapping
#             level_map = {1: "Low", 2: "Medium", 3: "High"}
#             security_level = level_map.get(numeric_level, "Low")
            
#             # Nudge History Se Percentage
#             all_nudges = list(db["nudge_history"].find({"userId": user_id}))
#             total = len(all_nudges)
            
#             cat_dist = {}
#             for cat in weak_cats:
#                 count = sum(1 for n in all_nudges if n.get("category") == cat)
#                 cat_dist[cat] = round((count / total * 100), 2) if total > 0 else 0
            
#             db["categorydata"].update_one(
#                 {"user_id": user_id},
#                 {"$set": {
#                     "user_id": user_id,
#                     "weak_categories": weak_cats,
#                     "nudge_distribution": cat_dist,
#                     "security_level": security_level,
#                     "updatedAt": datetime.utcnow()
#                 }},
#                 upsert=True
#             )
        
#         return {"status": "success", "message": "Nudge status updated and behavior adapted"}

#     except Exception as e:
#         print(f"❌ Interaction Error: {e}")
#         return {"status": "error", "message": str(e)}
# # -----------------------------------------------------------
# # ✅ AUTOMATED NUDGE FUNCTION (Decay & Thompson Integration)
# # -----------------------------------------------------------
# async def auto_check_nudges():
#     print("⏰ Thompson Engine: Checking for pending nudges...")
#     # Find sync hai, isliye simple list ya cursor use karein
#     users = users_collection.find({"fcm_token": {"$exists": True}})
    
#     for user in users:
#         try:
#             user_id = str(user["_id"])
#             # Ye await theek hai kyunki get_nudge khud 'async def' hai
#             await get_nudge(user_id)
#         except Exception as e:
#             print(f"⚠️ Error processing user: {e}")
# if __name__ == "__main__":
#     uvicorn.run(app, host="0.0.0.0", port=8000)






from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pymongo import MongoClient
from datetime import datetime
from pydantic import BaseModel
import uvicorn
import traceback
import firebase_admin
from firebase_admin import credentials, messaging
from bson import ObjectId
import numpy as np  
from collections import defaultdict
from ai_model import predict_url
from flashcard import get_topic_data, save_user_quiz_score, HARDCODED_TOPICS
from routes.all_routes import router as all_routes_router
import requests
from apscheduler.schedulers.background import BackgroundScheduler
import asyncio
from fastapi import FastAPI, Request, BackgroundTasks, HTTPException, Query
from fastapi.responses import JSONResponse
from bson import ObjectId
from nudge_engine import DynamicNudgeEngine
from thompson_engine import ThompsonNudgeEngine
from passlib.context import CryptContext
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")
cred = credentials.Certificate("firebase-key.json")
if not firebase_admin._apps:
    firebase_admin.initialize_app(cred)

# def send_fcm_nudge(token, title, body, category, user_id):
    
#     message = messaging.Message(
#         data={
#             "title": title,
#             "body": body,
#             "userId": str(user_id),
#             "category": category,
#             "action_type": "nudge_response"
#         },
#         token=token,
#     )
    
#     try:
#         response = messaging.send(message)
#         print(f"🚀 FCM Nudge Sent ({category}):", response)
#         return True
#     except Exception as e:
#         # ✨ NEW: Agar token expire ya delete ho chuka hai (Entity not found)
#         if "Requested entity was not found" in str(e):
#             print(f"🧹 Dead token found for user {user_id}. Removing from DB...")
#             # Ye line database se us ghalat token ko hata degi
#             # db.users.update_one(
#             #     {"_id": ObjectId(user_id)}, 
#             #     {"$unset": {"fcm_token": ""}} 
#             # )
#             users_collection.update_one({"_id": ObjectId(user_id)}, {"$unset": {"fcm_token": ""}})
        
#         print(f"❌ FCM Error details: {e}")
#         return False
def send_fcm_nudge(token, title, body, category, user_id):
    message = messaging.Message(
             notification=messaging.Notification(
            title=title,
            body=body,
        ),
        
        # 2. Ye data section app ke logic ke liye (click handling wagera)
        data={
            "title": title,
            "body": body,
            "userId": str(user_id),
            "category": category,
            "action_type": "nudge_response"
        },
        token=token,
    )
    
    try:
        response = messaging.send(message)
        print(f"🚀 FCM Nudge Sent ({category}):", response)
        return True
    except Exception as e:
        if "Requested entity was not found" in str(e):
            print(f"🧹 Dead token found for user {user_id}. Removing from DB...")
            users_collection.update_one({"_id": ObjectId(user_id)}, {"$unset": {"fcm_token": ""}})
        
        print(f"❌ FCM Error details: {e}")
        return False
async def check_and_send_scheduled_nudges():
    print("⏰ Checking for scheduled nudges...")
    active_users = users_collection.find({"fcm_token": {"$exists": True}})
    
    for user in active_users:
        user_id = str(user["_id"])
        
        # Thompson Engine check (Force=False by default)
        final_data = thompson_gen.generate_final_nudge(user_id, nudge_gen)

        if final_data:
           # nudge_to_send = final_data["nudge_content"] # Direct content use karein
            nudge_to_send = final_data["nudge_content"][0]
            success = send_fcm_nudge(
                token=user["fcm_token"],
                title=f"🛡️ Nexus Shield: {nudge_to_send['category']}",
                body=nudge_to_send['nudge'],
                category=nudge_to_send['category'],
                user_id=user_id
            )
            
            if success:
               
                print(f"🚀 Automated Nudge sent to {user.get('email', 'User')}")
app = FastAPI()
scheduler = BackgroundScheduler()


def run_automation():
    print("⏰ Checking for scheduled nudges and syncing ignored ones...")
    thompson_gen.sync_ignored_nudges()
    
    try:
        # Check karein agar koi loop pehle se chal raha hai
        loop = asyncio.get_event_loop()
    except RuntimeError:
        # Agar nahi chal raha toh naya banayein
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
    
    loop.run_until_complete(check_and_send_scheduled_nudges())
scheduler.add_job(
    run_automation,
    'interval', 
    minutes=11,
)
scheduler.start()
# ✅ Routers
app.include_router(all_routes_router, prefix="/api")

class UpdateProfileModel(BaseModel):
    name: str
    email: str
# ✅ MongoDB Connection
try:
    client = MongoClient(
        "mongodb+srv://nexus_user1:4PAiHn%219B%25D.uDM@cluster0.begtxob.mongodb.net/nexusshield?retryWrites=true&w=majority&appName=Cluster0"
    )
    db = client["nexusshield"]
    users_collection = db["users"]
    quiz_scores_collection = db["quizscores"]
    progress_collection = db["progress"]
    trainingdata_collection = db["trainingdata"]
    db_cyber = client["cyber_training"]
    topics_collection = db_cyber["topics"]
    messages_collection = db["messages"]
    nudge_gen = DynamicNudgeEngine(db)
    thompson_gen = ThompsonNudgeEngine(db)
    survey_collection = db["surveys"]
    category_data_collection = db["categorydata"]
    print("✅ MongoDB connected successfully!")
except Exception as e:
    print("❌ MongoDB connection failed:", e)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# -----------------------------------------------------------
# ✅ db of model
# -----------------------------------------------------------
@app.get("/test-db")
def test_connection():
    try:
        # Ye line check karti hai ke Atlas ne respond kiya ya nahi
        client.admin.command('ping')
        return {"status": "success", "message": "connected sucessfulyy."}
    except Exception as e:
        return {"status": "error", "message": f"Connection Fail: {str(e)}"}

class URLRequest(BaseModel):
    url: str  
    user_id: str = None    
    user_name: str = None

@app.post("/predict")
def predict_url_endpoint(data: URLRequest):
    try:
        # 1. Sab se pehle link check karo
        result = predict_url(data.url)
        label = result.get("label", "UNKNOWN").upper()

        # data.url aur data.user_id direct use karein (getattr ki zaroorat nahi)
        user_id = data.user_id 
        user_name = data.user_name or "Unknown"

        try:
            if user_id:
                label_upper = label.upper()

                # ✅ Sahi Spacing: Ye sara logic 'if user_id' ke andar hona chahiye
                if "PHISHING" in label_upper:
                    update_field = "summary.phishing_count"
                elif "UNSAFE" in label_upper or "CAUTION" in label_upper or "PARTIAL" in label_upper:
                    # "POTENTIALLY UNSAFE" ab yahan count hoga
                    update_field = "summary.partial_phishing_count"
                elif "SAFE" in label_upper:
                    update_field = "summary.safe_count"
                else:
                    # Default case agar koi match na mile
                    update_field = "summary.safe_count"

                # Database update query (Ye bhi 'if user_id' ke andar rahay gi)
                db["stats"].update_one(
                    {"user_id": user_id},
                    {
                        "$set": {"user_name": user_name},
                        "$inc": {
                            "summary.total_checked": 1,
                            update_field: 1
                        },
                        "$push": {
                            "history": {
                                "url": data.url, 
                                "result": label,
                                "timestamp": datetime.utcnow()
                            }
                        }
                    },
                    upsert=True
                )
                print(f"📊 Stats updated for {user_name}")

        except Exception as stats_err:
            print(f"⚠️ Stats Update Error (Silent): {stats_err}")
        return result

    except Exception as e:
        print(f"❌ Main Error: {e}")
        return {"label": "❌ ERROR", "error": str(e)}
# -----------------------------------------------------------
# ✅ TRAINING & PROGRESS ROUTES
# -----------------------------------------------------------

@app.get("/topics/{level}")
async def get_level_topics(level: int):
    topics = HARDCODED_TOPICS.get(level, [])
    if not topics:
        return JSONResponse({"topics": [], "message": "Level not found"}, status_code=404)
    return {"topics": topics}

@app.get("/get-content")
async def get_content(topic: str, level: int):
    clean_topic = topic.strip()
    try:
        content = get_topic_data(clean_topic, level)
        if content:
            return content
        return JSONResponse(status_code=404, content={"error": "Not found"})
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

@app.post("/api/save-quiz-result")
async def save_quiz_result(request: Request):
    try:
        final_return_avg = 0
        data = await request.json()
        
        user_id = data.get("user_id")
        user_name = data.get("user_name", "Unknown") 
        new_score = float(data.get("score", 0))
        total_val = data.get("total", 0)

        # --- FIX: Fetch Level using _id and ObjectId ---
        # Screenshot ke mutabiq ID '_id' field mein hai
        user_profile = db["users"].find_one({"_id": ObjectId(user_id)})
        
        if user_profile:
            # Screenshot ke mutabiq: level: 1
            db_val = user_profile.get("level", 3)
            # Aapka logic: 1=High, 2=Medium, 3=Low
            level_map = {1: "Low", 2: "Medium", 3: "High"}
            display_level = level_map.get(int(db_val), "Low")
        else:
            # Agar user nahi mila toh fallback
            display_level = "Low" 

        # --- Baqi logic same rahega ---
        existing_data = db["trainingdata"].find_one({"user_id": user_id})
        current_percentage = (new_score / total_val) * 100 if total_val > 0 else 0

        if existing_data:
            old_avg = float(existing_data.get("quizScore") or 0)
            old_count = int(existing_data.get("quizzesAttempted") or 0)
            
            new_count = old_count + 1
            avg_score = ((old_avg * old_count) + current_percentage) / new_count
            final_return_avg = avg_score
            
            # --- UPDATED LOGIC HERE ---
            # Har 3 quizzes ke baad 1 lesson barhayen
            lesson_increment = 1 if new_count % 3 == 0 else 0
            
            db["trainingdata"].update_one(
                {"user_id": user_id},
                {
                    "$inc": {
                        "lessonsCompleted": lesson_increment, 
                        "quizzesAttempted": 1
                    }, 
                    "$set": {
                        "user_name": user_name,
                        "level": display_level,
                        "quizScore": round(avg_score, 2),
                        "updatedAt": datetime.utcnow() 
                    }
                }
            )
        else:
            final_return_avg = current_percentage
            db["trainingdata"].update_one(
                {"user_id": user_id},
                {
                    "$set": {
                        "user_id": user_id,
                        "user_name": user_name,
                        "level": display_level,
                        "quizScore": round(current_percentage, 2), 
                        "quizzesAttempted": 1, 
                        "lessonsCompleted": 1,
                        "updatedAt": datetime.utcnow() 
                    }
                },
                upsert=True
            )

        db["quizscores"].insert_one({
            "user_id": user_id, 
            "user_name": user_name,
            "range": f"{int(new_score)}/{total_val}", 
            "score": new_score,
            "timestamp": datetime.utcnow()
        })
        
        return {"status": "success", "average_score": round(final_return_avg, 2)}

    except Exception as e:
        print(f"Error: {e}")
        return JSONResponse(status_code=500, content={"error": str(e)})
@app.get("/api/progress/{user_id}") 
async def get_user_progress(user_id: str):
    try:
        # 'progress' ki jagah ab 'trainingdata' se find karega
        progress_data = db["trainingdata"].find_one({"user_id": user_id}, {"_id": 0})
        
        if progress_data:
            return progress_data
            
        # Agar data nahi milta toh default values
        return {
            "lessonsCompleted": 0, 
            "quizzesAttempted": 0, 
            "quizScore": 0, 
            "level": "Low"
        }
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})
# -----------------------------------------------------------
# ✅ Progress Report
# -----------------------------------------------------------
@app.get("/api/progress-stats/{user_id}")
async def get_progress_stats(user_id: str):
    try:
        from bson import ObjectId

        # ✅ Get the LATEST training document for this user
        train_data = db["trainingdata"].find_one(
            {"user_id": user_id},
            sort=[("updatedAt", -1)]   # Sorts by newest first
        )
        
        lessons = 0
        quizzes = 0
        score_percent = 0.0
        if train_data:
            lessons = train_data.get("lessonsCompleted", 0)
            quizzes = train_data.get("quizzesAttempted", 0)
            score_percent = float(train_data.get("quizScore", 0))
        
        # Get user level from users collection
        user_info = db["users"].find_one({"_id": ObjectId(user_id)})
        level_text = "Low"
        if user_info:
            level_val = user_info.get("level", 1)
            if level_val == 3:
                level_text = "High"
            elif level_val == 2:
                level_text = "Medium"
            else:
                level_text = "Low"
        
        normalized_score = round(score_percent / 100, 2)
        
        return {
            "lessons": lessons,
            "quizzes": quizzes,
            "quizScoreAvg": normalized_score,
            "level": level_text
        }
    except Exception as e:
        print(f"❌ Progress stats error: {e}")
        return {"lessons": 0, "quizzes": 0, "quizScoreAvg": 0, "level": "Low"}
# -----------------------------------------------------------
# ✅ AUTHENTICATION
# -----------------------------------------------------------
@app.post("/signup")
#async def signup(request: Request):
async def signup(request: Request, background_tasks: BackgroundTasks):
    data = await request.json()
    email = data.get("email")
    raw_password = data.get("password")
    if not raw_password:
        return JSONResponse({"message": "Password is required"}, status_code=400)

    # ✅ Fix: Password ko string mein convert karke hash karein
    # Is se passlib ko "72-byte" wala confusion nahi hoga
    hashed_password = pwd_context.hash(str(raw_password))
    if users_collection.find_one({"email": email}):
        return JSONResponse({"message": "User already exists"}, status_code=400)
    
    # ✅ 1. Insert karne ke baad result ko variable mein rakhein
    result = users_collection.insert_one({
        "name": data.get("name"), 
        "email": email, 
        # "password": data.get("password"),
        "password": hashed_password,
        "fcm_token": data.get("fcm_token"),
        "role": data.get("role"), 
        "createdAt": datetime.utcnow(),
        "surveyDone": False,
    })
    new_user_id = str(result.inserted_id)
    background_tasks.add_task(trigger_signup_nudge, new_user_id)
    # ✅ 2. Response mein 'user_id' lazmi bhejein (string mein convert kar ke)
    return {
        "message": "User registered successfully",
        "user_id": str(result.inserted_id) # 👈 Ye line miss thi!
    }


@app.post("/login")
#async def login(request: Request):
async def login(request: Request, background_tasks: BackgroundTasks):    
    try:
        data = await request.json()
        email = data.get("email")
        password = data.get("password")
        fcm_token = data.get("fcm_token")
        
        # user = users_collection.find_one({"email": email, "password": password})
        user = users_collection.find_one({"email": email})
        # if not user:
        #     return JSONResponse({"message": "Invalid credentials"}, status_code=401)
        if not user or not pwd_context.verify(password, user.get("password")):
            return JSONResponse({"message": "Invalid password"}, status_code=401)
        if fcm_token:
            users_collection.update_one(
                {"_id": user["_id"]},
                {"$set": {"fcm_token": fcm_token}}
            )
            print(f"✅ FCM Token updated for {email}")

        # --- CRITICAL FIX FOR NUDGE ENGINE ERROR ---
        # Agar aapka Nudge Engine background mein level check karta hai,
        # toh check karein ke level string hai ya nahi.
        user_level = user.get("level", "Beginner")
        
    
        level_map = {"Beginner": 1, "Intermediate": 2, "Advanced": 3}
        # Agar database mein "Intermediate" hai toh ye 2 return karega
        numeric_level = level_map.get(user_level, 1) 

        print(f"User Level: {user_level} (Numeric: {numeric_level})")
        # --- Nudge Trigger Logic (5 Minutes Delay) ---
        user_id_str = str(user.get("_id"))
       # background_tasks.add_task(trigger_login_nudge, user_id_str)
        return {
            "message": "Login successful", 
            "user": {
                "name": user.get("name"), 
                "email": user.get("email"),
                "user_id": str(user.get("_id")),
                "surveyDone": user.get("surveyDone", False),
                "level": user_level, 
                "level_num": numeric_level 
            }
        }
    except Exception as e:
        print(f"❌ Login Crash Error: {str(e)}")
        return JSONResponse({"message": "Server error during login", "error": str(e)}, status_code=500)
#------------------------------------------------------
#------------------------------------------------------
# --- SIGNUP TRIGGER ---
# --- SIGNUP TRIGGER ---
async def trigger_signup_nudge(user_id: str):
    try:
        # 300 ko hata kar 20 seconds karein taake foran check ho sake
        print(f"⏳ Waiting 12min to send Welcome Nudge to {user_id}...")
        await asyncio.sleep(720)  
        
        # Thompson Engine ko call karein
        # Ensure karein ke aapka ThompsonEngine class 'force' argument handle karta hai
        nudge = thompson_gen.generate_final_nudge(user_id, nudge_gen, force=True)
        
        if nudge:
            await execute_nudge_send(user_id, nudge, "🛡️ Welcome to Nexus Shield!")
        else:
            print(f"⚠️ No nudge generated for {user_id} even with force=True")
    except Exception as e:
        print(f"⚠️ Signup Nudge Error: {e}")

# --- LOGIN TRIGGER ---
async def trigger_login_nudge(user_id: str):
    pass
#     try:
#         # Login ke baad testing ke liye 10 seconds wait rakhein
#         await asyncio.sleep(61) 
#         # ✅ FIX: force=True add kiya taake login par lazmi nudge mile
#         nudge = thompson_gen.generate_final_nudge(user_id, nudge_gen, force=True)
#         if nudge:
#             await execute_nudge_send(user_id, nudge, "🛡️ Welcome Back!")
#     except Exception as e:
#         print(f"⚠️ Login Nudge Error: {e}")
  
# --- COMMON HELPER ---
# --- COMMON HELPER ---
async def execute_nudge_send(user_id, nudge, title):
    try:
        # 1. User find karein (ObjectId check ke saath)
        user = users_collection.find_one({"_id": ObjectId(user_id)})
        
        if not user:
            print(f"❌ User {user_id} not found in database.")
            return
            
        if "fcm_token" not in user or not user["fcm_token"]:
            print(f"⚠️ User {user_id} has no FCM token. Skipping...")
            return

        # 2. Content format handle karein
        content = nudge["nudge_content"][0] if isinstance(nudge["nudge_content"], list) else nudge["nudge_content"]

        # 3. Notification send karein
        success = send_fcm_nudge(
            token=user["fcm_token"], 
            title=title, 
            body=content['nudge'], 
            category=content['category'], 
            user_id=user_id
        )
        
        if success:
            # 4. History save karein
            db.nudge_history.insert_one({
                "userId": user_id,
                "nudgeId": nudge["nudgeId"],
                "category": content['category'],
                "action": "sent",
                "timestamp": datetime.utcnow()
            })
            
            # 5. Thompson Stats update karein
            db.thompson_stats.update_one(
                {"userId": user_id},
                {"$push": {"sent_nudge_ids": nudge["nudgeId"]}},
                upsert=True 
            )
            print(f"🚀 Nudge sent and tracked for user: {user_id}")
        else:
            print(f"❌ FCM Send failed for user: {user_id}")

    except Exception as e:
        print(f"🔥 Critical Error in execute_nudge_send: {str(e)}")
    # -----------------------------------------------------------
# ✅ Log out
# -----------------------------------------------------------
@app.post("/api/logout/{user_id}")
async def logout(user_id: str):
    try:
        # User ka fcm_token delete kar rahe hain taake scheduler usay na pakray
        result = users_collection.update_one(
            {"_id": ObjectId(user_id)}, 
            {"$unset": {"fcm_token": ""}}
        )
        if result.modified_count > 0:
            return {"status": "success", "message": "Logged out and token removed"}
        return {"status": "error", "message": "User not found or token already gone"}
    except Exception as e:
        return {"status": "error", "message": str(e)}
# -----------------------------------------------------------
# ✅ profile screeen
# -----------------------------------------------------------
@app.get("/api/user/{user_id}")
async def get_user_profile(user_id: str):
    user = users_collection.find_one({"_id": ObjectId(user_id)})
    if user:
        return {
            "name": user.get("name"),
            "email": user.get("email")
        }
    raise HTTPException(status_code=404, detail="User not found")

# 2. User ka data update karne ke liye (Save button par)
@app.put("/api/update-profile/{user_id}")
async def update_profile(user_id: str, profile_data: UpdateProfileModel):
    result = users_collection.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {
            "name": profile_data.name, 
            "email": profile_data.email
        }}
    )
    
    if result.matched_count > 0:
        return {
            "status": "success", 
            "message": f"Profile updated! New name: {profile_data.name}"
        }
    return {"status": "error", "message": "Update failed"}
@app.post("/api/report-content")
async def report_content(data: dict):
    try:
        messages_collection.insert_one(data)
        return {"status": "success", "message": "Report saved!"}
    except Exception as e:
        return {"status": "error", "message": str(e)}
    
    # -----------------------------------------------------------
# ✅ SUGGEST IMPROVEMENT ENDPOINT
# -----------------------------------------------------------
@app.post("/api/suggest-improvement")
async def suggest_improvement(data: dict):
    try:
        # Optional: validate required fields
        if not data.get("message"):
            return JSONResponse(
                status_code=400,
                content={"status": "error", "message": "Message is required"}
            )
        
        # Insert into a new collection "suggestions"
        db["suggestions"].insert_one({
            "userId": data.get("userId"),
            "userName": data.get("userName", "Anonymous"),
            "message": data.get("message"),
            "timestamp": datetime.utcnow()
        })
        return {"status": "success", "message": "Suggestion saved!"}
    except Exception as e:
        print(f"❌ Suggestion error: {e}")
        return JSONResponse(
            status_code=500,
            content={"status": "error", "message": str(e)}
        )
# -----------------------------------------------------------
# ✅ SAVE SURVEY RESULTS & CALCULATE LEVEL
# -----------------------------------------------------------
CATEGORY_MAP = {
    "T1": "Password Security", "T2": "Device Security", "T3": "Physical Security",
    "T4": "Network Security", "T5": "Password Security", "T6": "Password Security",
    "T7": "Software Updates", "T8": "Malware Protection", "S1": "App Security",
    "S2": "Phishing", "S3": "Web Security", "S4": "Phishing",
    "S5": "Phishing", "S6": "Device Security"
}

@app.post("/survey")
async def save_survey(request: Request):
    try:
        data = await request.json()
        user_id = data.get("userId")
        answers = data.get("answers", []) 

        # --- 1. Fair Statistical Logic ---
        total_score = sum(a["score"] for a in answers)
        grouped_data = defaultdict(list)
        
        # Row format: ["T1 : Password Security : 5", "S2 : Phishing : 4"]
        descriptive_results = []

        for a in answers:
            q_id = a["questionId"]
            score = a["score"]
            cat_name = CATEGORY_MAP.get(q_id, "General")
            
            descriptive_results.append(f"{q_id} : {cat_name} : {score}")
            grouped_data[cat_name].append(score)

        # Category Averages (Simple Mean - No Penalty)
        category_scores = {
            cat: round(np.mean(scores), 2) 
            for cat, scores in grouped_data.items()
        }

        weak_cats = []
        
        # Ab har category ke average ko seedha 3.0 se check karein
        for cat, avg in category_scores.items():
            if avg < 3.0:
                weak_cats.append(cat)
        # --- 3. Level Calculation ---
        # --- 2. Level Calculation (Numeric Save) ---
        percentage = round((total_score / 70) * 100, 2)
        
        # Strings ke bajaye Numbers use kar rahe hain
        if percentage >= 75:
            user_level = 3  # Advanced
        elif percentage >= 45:
            user_level = 2  # Intermediate
        else:
            user_level = 1  # Beginner

        # --- 3. Database Structure Update ---
        formatted_survey = {
            "userId": str(user_id),
            "descriptive_results": descriptive_results,
            "category_scores": category_scores,
            "weak_categories": weak_cats,
            "total_score": total_score,
            "percentage": percentage,
            "level": user_level,  # Ab ye 1, 2, ya 3 save hoga
            "timestamp": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
        } 

        survey_collection.insert_one(formatted_survey)
        
        # User profile update
        users_collection.update_one(
            {"_id": ObjectId(user_id) if len(user_id) == 24 else user_id},
            {"$set": {
                "surveyDone": True, 
                "level": user_level,
                "cyber_hygiene_score": percentage
            }}
        )

        return {
            "status": "success",
            "level": user_level,
            "percentage": percentage,
            "weak_points": weak_cats,
            "results": descriptive_results
        }

    except Exception as e:
        print(f"DEBUG ERROR: {str(e)}")
        return JSONResponse(status_code=500, content={"error": str(e)})
    # -----------------------------------------------------------
# ✅ categorydata for progress report
# -----------------------------------------------------------
@app.get("/api/user-category-report/{user_id}")
async def get_category_report(user_id: str):
    try:
        # Survey se data uthayein
        survey = db["surveys"].find_one({"userId": user_id}, sort=[("timestamp", -1)])
        if not survey:
            return {"error": "Survey not found"}

        weak_cats = survey.get("weak_categories", [])
        
        # Level hamesha 'users' collection se uthayein (Integer format mein)
        user_info = db["users"].find_one({"_id": ObjectId(user_id)})
        numeric_level = user_info.get("level", 1) if user_info else 1

        # Nudge history se interactions count karein
        all_nudges = list(db["nudge_history"].find({"userId": user_id}))

        # ✨ UPDATED LOGIC ✨
        # 15 nudges ka target rakhte hain (Taki user ko mehnat karni pare)
        TARGET_PER_CAT = 15 
        category_percentages = {}

        for cat in weak_cats:
            # Sirf wo count karein jo user ne "mark_as_read" kiye hain
            read_count = sum(1 for n in all_nudges if n.get("category") == cat and n.get("action") == "mark_as_read")
            
            # Progress calculation (Slow increase)
            progress = (read_count / TARGET_PER_CAT) * 100
            # Isay 100 se ooper nahi janay dena
            category_percentages[cat] = min(round(progress, 2), 100)

        # Frontend ke liye status decide karein (Jaisa aapne kaha 50% threshold)
        # Yeh aap frontend pe bhi kar sakti hain aur yahan status bhej bhi sakti hain
        
        report_data = {
            "user_id": user_id,
            "weak_categories": weak_cats,
            "nudge_distribution": category_percentages, # Yeh ab 6.6%, 13.3% karke barhega
            "security_level": numeric_level, # Numeric bhej rahe hain taake crash na ho
            "updatedAt": datetime.utcnow()
        }

        # Database update
        db["categorydata"].update_one(
            {"user_id": user_id},
            {"$set": report_data},
            upsert=True
        )

        return {"status": "success", "data": report_data}

    except Exception as e:
        print(f"Report Error: {e}")
        return {"error": str(e)}
# -----------------------------------------------------------
# ✅ REAL-TIME AI NUDGE ENGINE (Thompson Sampling)
# -----------------------------------------------------------
# @app.get("/api/get-nudge/{user_id}")
# async def get_nudge(user_id: str):
#     try:
#         # 1. 🟢 Ye Engine Async hai, is par await LAZMI hai
#         # Thompson logic results calculate karke layega
#         final_data =  thompson_gen.generate_final_nudge(user_id, nudge_gen)

#         if not final_data:
#             return {"status": "wait", "message": "Not the right time or gap for a nudge."}

#         # 2. 🟡 Ye Database Sync hai, is par await NAHI lagana
#         # Agar yahan await lagaya toh "NoneType" ya "Not awaitable" error ayega
#         user = users_collection.find_one({"_id": ObjectId(user_id)})
        
#         if not user or not user.get("fcm_token"):
#              return {"status": "error", "message": "No FCM token found for user"}

#         # 3. Notification bhejnah (Sync function)
#         nudge_to_send = final_data["nudge_content"][0] 
        
#         notification_sent = send_fcm_nudge(
#             token=user.get("fcm_token"),
#             title=f"🛡️ Security Alert: {nudge_to_send['category']}",
#             body=nudge_to_send['nudge'],
#             category=nudge_to_send['category'],
#             user_id=user_id
#         )

#         # 4. 🟡 History save karna (Sync call, No await)
#         if notification_sent:
#             db.nudge_history.insert_one({
#                 "userId": user_id,
#                 "category": nudge_to_send['category'],
#                 "nudge": nudge_to_send['nudge'],
#                 "combo": final_data["combo_metadata"],
#                 "timestamp": datetime.utcnow(),
#                 "action": "sent"
#             })

#         return {
#             "status": "success",
#             "nudge": nudge_to_send['nudge']
#         }

#     except Exception as e:
#         # Traceback print karein taake exact line pata chale agar phir error aaye
#         import traceback
#         traceback.print_exc()
#         print(f"❌ Nudge Engine Error: {e}")
#         return {"status": "error", "message": str(e)}
@app.get("/api/get-nudge/{user_id}")
async def get_nudge(user_id: str, force: bool = False): # 👈 Force parameter add kiya login ke liye
    try:
        # 1. Thompson logic (Force mode login/signup ke liye bypass karega gap check)
        final_data = thompson_gen.generate_final_nudge(user_id, nudge_gen, force=force)

        if not final_data:
            return {"status": "wait", "message": "Not the right time or gap."}

        user = users_collection.find_one({"_id": ObjectId(user_id)})
        if not user or not user.get("fcm_token"):
            return {"status": "error", "message": "No FCM token"}

        # 2. Content extraction (Index [0] check hata diya agar generate_final_nudge direct deta hai)
        nudge_to_send = final_data["nudge_content"]

        # 3. Notification bhejnah
        notification_sent = send_fcm_nudge(
            token=user.get("fcm_token"),
            title=f"🛡️ Security Alert: {nudge_to_send['category']}",
            body=nudge_to_send['nudge'],
            category=nudge_to_send['category'],
            user_id=user_id
        )

        
        
        return {"status": "success", "nudge": nudge_to_send['nudge']}

    except Exception as e:
        traceback.print_exc()
        return {"status": "error", "message": str(e)}
#----------------------------------------------
#-------get interaction-------
# @app.post("/api/nudge-interaction")
# async def nudge_interaction(request: Request):
#     try:
#         data = await request.json()
#         user_id = data.get("userId")
#         action = data.get("action") 
        
#         # 1. MongoDB se sahi field (timestamp_sent) se fetch karein
#         last_nudge = db.nudge_history.find_one(
#             {"userId": user_id}, 
#             sort=[("timestamp_sent", -1)] # 👈 Yahan 'timestamp' ki jagah 'timestamp_sent' kiya
#         )
        
#         if last_nudge and "combo" in last_nudge:
#             # 2. Thompson logic update (Sync function hai toh await hata dein)
#             thompson_gen.update_user_behavior(user_id, last_nudge["combo"], action)
            
#             # 3. History update (is_processed aur timestamp_action ke saath)
#             db.nudge_history.update_one(
#                 {"_id": last_nudge["_id"]},
#                 {"$set": {
#                     "action": action, 
#                     "timestamp_action": datetime.utcnow(), # 👈 Null khatam ho jayega
#                     "is_processed": True                  # 👈 False ab True ho jayega
#                 }}
#             )

#         # --- Baaki Survey wala logic (Niche wala) ---
#         survey = db["surveys"].find_one({"userId": user_id}, sort=[("timestamp", -1)])
        
#         if survey:
#             weak_cats = survey.get("weak_categories", [])
#             numeric_level = survey.get("level", 1)
            
#             # Level Mapping
#             level_map = {1: "Low", 2: "Medium", 3: "High"}
#             security_level = level_map.get(numeric_level, "Low")
            
#             # Nudge History Se Percentage
#             all_nudges = list(db["nudge_history"].find({"userId": user_id}))
#             total = len(all_nudges)
            
#             cat_dist = {}
#             for cat in weak_cats:
#                 count = sum(1 for n in all_nudges if n.get("category") == cat)
#                 cat_dist[cat] = round((count / total * 100), 2) if total > 0 else 0
            
#             db["categorydata"].update_one(
#                 {"user_id": user_id},
#                 {"$set": {
#                     "user_id": user_id,
#                     "weak_categories": weak_cats,
#                     "nudge_distribution": cat_dist,
#                     "security_level": security_level,
#                     "updatedAt": datetime.utcnow()
#                 }},
#                 upsert=True
#             )
        
#         return {"status": "success", "message": "Nudge status updated and behavior adapted"}

#     except Exception as e:
#         print(f"❌ Interaction Error: {e}")
#         return {"status": "error", "message": str(e)}
@app.post("/api/nudge-interaction")
async def nudge_interaction(request: Request):
    try:
        data = await request.json()
        user_id = data.get("userId")
        action = data.get("action")
        
        # 1. Update Behavior & History (Integrated Function)
        last_nudge = db.nudge_history.find_one(
            {"userId": user_id, "is_processed": False}, 
            sort=[("timestamp_sent", -1)]
        )
        
        if last_nudge:
            thompson_gen.update_user_behavior(user_id, last_nudge["combo"], action, last_nudge.get("nudgeId"))

        # 2. Category Data Update (Optimized)
        survey = db["surveys"].find_one({"userId": user_id}, sort=[("timestamp", -1)])
        if survey:
            weak_cats = survey.get("weak_categories", [])
            
            # memory load karne ke bajaye DB se count karwayein (Performance ⚡)
            total_history = db["nudge_history"].count_documents({"userId": user_id})
            cat_dist = {}
            for cat in weak_cats:
                cat_count = db["nudge_history"].count_documents({"userId": user_id, "category": cat})
                cat_dist[cat] = round((cat_count / total_history * 100), 2) if total_history > 0 else 0

            db["categorydata"].update_one(
                {"user_id": user_id},
                {"$set": {
                    "weak_categories": weak_cats,
                    "nudge_distribution": cat_dist,
                    "security_level": {1:"Low", 2:"Medium", 3:"High"}.get(survey.get("level", 1)),
                    "updatedAt": datetime.utcnow()
                }},
                upsert=True
            )
        
        return {"status": "success", "message": "Behavior adapted"}
    except Exception as e:
        return {"status": "error", "message": str(e)}
# -----------------------------------------------------------
# ✅ AUTOMATED NUDGE FUNCTION (Decay & Thompson Integration)
# -----------------------------------------------------------
async def auto_check_nudges():
    print("⏰ Thompson Engine: Checking for pending nudges...")
    # Find sync hai, isliye simple list ya cursor use karein
    users = users_collection.find({"fcm_token": {"$exists": True}})
    
    for user in users:
        try:
            user_id = str(user["_id"])
            # Ye await theek hai kyunki get_nudge khud 'async def' hai
            await get_nudge(user_id)
        except Exception as e:
            print(f"⚠️ Error processing user: {e}")
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)