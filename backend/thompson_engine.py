# import random
# import numpy as np
# from datetime import datetime, timedelta
# from bson import ObjectId
# import uuid
# from collections import Counter

# class ThompsonNudgeEngine:
#     def __init__(self, db):
#         self.db = db
#         self.decay_factor = 0.95
#         self.arms = {
#             "length": ["short", "medium", "long"],
#             "tone": ["friendly", "warning", "motivational"],
#             "complexity": ["simple", "moderate", "technical"],
#             "type": ["tip", "education", "alert"],
#             "personalization": ["general", "personalized"]
#         }

#     # ---------------------------------------------------------
#     # memory initialization (AI Brain Memory)
#     # ---------------------------------------------------------
#     def get_user_stats(self, user_id):
#         stats = self.db.thompson_stats.find_one({"userId": str(user_id)})
        
#         if not stats:
#             stats = {
#                 "userId": str(user_id),
#                 "dimensions": {}, 
#                 "sent_nudge_ids": [], # Taake repeat na ho
#                 # "dismiss_streak": 0,  # Frequency control ke liye
#                 # "mastered_categories_count": 0,
#                 # "current_dynamic_freq": 8 # Default freq
#                 "negative_behavior_days": 0, # Frequency control ke liye (NEW)
#                 "last_behavior_date": None
#             }
#             for dim, options in self.arms.items():
#                 stats["dimensions"][dim] = {opt: {"alpha": 1, "beta": 1} for opt in options}
#             #self.db.thompson_stats.insert_one(stats)
#             self.db.thompson_stats.insert_one(stats)
#         return stats
#     def select_best_combo(self, stats):
#         selected_combo = {}
#         all_dims = list(stats["dimensions"].keys())
#         num_to_select = random.randint(2, len(all_dims)) 
#         chosen_dims = random.sample(all_dims, num_to_select)

#         for dim in chosen_dims:
#             options = stats["dimensions"][dim]
#             best_sample = -1
#             best_arm = None
#             for arm_name, values in options.items():
#                 sample = np.random.beta(values["alpha"], values["beta"])
#                 if sample > best_sample:
#                     best_sample = sample
#                     best_arm = arm_name
            
#             # ✅ Ye line ab sahi jagah par hai (inner loop ke bahar)
#             selected_combo[dim] = best_arm

#         return selected_combo
#     # ---------------------------------------------------------
#     # ADAPT BEHAVIOR: Training Logic
#     # ---------------------------------------------------------
#     def update_user_behavior(self, user_id, combo, action, nudge_id=None):
#         if action == "sent":
#             return

#         stats = self.get_user_stats(user_id)
#         # "read" aur "mark_as_read" dono ko success maanein
#         success = 1 if action in ["mark_as_read", "read"] else 0
        
#         # --- 3-Day Observation & 4-Success Streak Logic ---
#         current_date = datetime.utcnow().date()
#         last_date = stats.get("last_behavior_date")
#         neg_days = stats.get("negative_behavior_days", 0)
#         success_streak = stats.get("consecutive_success_count", 0)

#         if success:
#             success_streak += 1
#             # Agar lagataar 4 baar success ho jaye toh penalty khatam (neg_days reset)
#             if success_streak >= 4:
#                 neg_days = 0
#                 success_streak = 0
#         else:
#             # Penalty logic: Success streak toot gayi
#             success_streak = 0
#             if last_date and str(last_date) != str(current_date):
#                 neg_days += 1 

#         # --- Thompson Sampling Training ---
#         dimensions = stats["dimensions"]
#         for dim, selected_arm in combo.items():
#             for arm in dimensions[dim]:
#                 dimensions[dim][arm]["alpha"] *= self.decay_factor
#                 dimensions[dim][arm]["beta"] *= self.decay_factor
            
#             if success:
#                 dimensions[dim][selected_arm]["alpha"] += 1
#             else:
#                 dimensions[dim][selected_arm]["beta"] += 1
#         all_history = list(self.db.nudge_history.find({"userId": str(user_id)}))
#         total_sent = len(all_history)
#         reads = sum(1 for n in all_history if n.get("action") == "read")
#         dismisses = sum(1 for n in all_history if n.get("action") == "dismissed")
#         from collections import Counter
#         current_level_reads = [h["category"] for h in all_history if h.get("action") == "read"]
#         read_counts = Counter(current_level_reads)
#         mastered_at_this_level = [cat for cat, count in read_counts.items() if count >= 100]

# # 3. Latest Nudge Details for UI
#         last_nudge = self.db.nudge_history.find_one({"userId": str(user_id)}, sort=[("timestamp_sent", -1)])
#         target_action = "read" if success else "dismissed"

        
#         # 1. Update Thompson Stats
#         self.db.thompson_stats.update_one(
#             {"userId": str(user_id)},
#             {"$set": {
#                 "nudge_stats": {
#                     "total_sent": total_sent,
#                     "read_count": reads,
#                     "dismiss_count": dismisses,
#                     "read_rate": f"{(reads/total_sent)*100:.1f}%" if total_sent > 0 else "0%",
#                     "dismiss_rate": f"{(dismisses/total_sent)*100:.1f}%" if total_sent > 0 else "0%",
#                     "dismiss_streak": neg_days
#                 },
#                 # Engine details generate_final_nudge se update ho chuki hongi, yahan improve_category add karein
#                 "engine_details.improve_category": combo.get("category", "General"),
#                 #"engine_details.mastered_categories": list({n["category"] for n in all_history if n.get("action") == "read"}),
#                 "engine_details.mastered_categories": mastered_at_this_level,
#                 "engine_details.negative_behavior_days": neg_days,         
#                 "engine_details.consecutive_success_count": success_streak, 
#                 "engine_details.last_behavior_date": str(current_date),                 
#                 "latest_interaction": {
#                     "nudgeId": str(nudge_id),
#                     "category": combo.get("category"),
#                     "combo": combo,
#                     "last_action": target_action,
#                     "timestamp_received": last_nudge.get("timestamp_sent") if last_nudge else None,
#                     "timestamp_action": datetime.utcnow()
#                 },
                
#                 "dimensions": dimensions
#                 },
#                 "$unset": 
#                 {    "negative_behavior_days": "", 
#                     "consecutive_success_count": "",
#                     "last_behavior_date": ""
#                 }
#             },
            
            
#             upsert=True
#         )

#         # 2. FIX: Nudge History Update
#         if not nudge_id:
#             return

#         # User data fetch for name
#         user_data = self.db.users.find_one({"_id": ObjectId(user_id)})
#         current_user_name = user_data.get("name", "Unknown") if user_data else "Unknown"
        
#         target_action = "read" if success else "dismissed"
        
#         # Database update with all fields
#         update_result = self.db.nudge_history.update_one(
#             {
#                 "userId": str(user_id), 
#                 "nudgeId": str(nudge_id), 
#                 "is_processed": False
#             },
#             {"$set": {
#                 "userName": current_user_name,
#                 #"category": "Network Security",
#                 "combo": combo,
#                 "action": target_action,      
#                 "status_label": "result_recorded", 
                
#                 "timestamp_action": datetime.utcnow(), 
#                 "is_processed": True 
#             }}
#         )

#         # Success/Warning logic
#         if update_result.modified_count > 0:
#             print(f"Success: {current_user_name} - All fields updated including combo")
#         else:
#             print(f"Warning: No record found for User: {user_id} with Nudge: {nudge_id} and is_processed: False")
        
#     # ---------------------------------------------------------
#     # LEVEL & FREQUENCY LOGIC
#     # ---------------------------------------------------------
    

#     def check_and_upgrade_level(self, user_id):
#         survey = self.db["surveys"].find_one({"userId": str(user_id)}, sort=[("timestamp", -1)])
#         if not survey: return
        
#         weak_cats = survey.get("weak_categories", [])
#         current_level = survey.get("level", 1)
#         if current_level >= 3: return
#         read_history = list(self.db.nudge_history.find({"userId": str(user_id), "action": "read"}))
        
#         # 2. Har category ke reads count karein
#         from collections import Counter
#         read_counts = Counter([h["category"] for h in read_history if "category" in h])

#         # 3. Mastered categories (Jinke 100 reads pure hain)
#         mastered_categories = [cat for cat, count in read_counts.items() if count >= 100]

#         # 4. Check: Kya saari weak categories mastered hain?
#         all_weak_mastered = all(cat in mastered_categories for cat in weak_cats) if weak_cats else False

#         # Stats update karein UI ke liye
#         self.db.thompson_stats.update_one(
#             {"userId": str(user_id)}, 
#             {"$set": {"engine_details.mastered_categories": mastered_categories}}
#         )

#         # 5. Level Upgrade aur Reset Logic
#         if all_weak_mastered and len(weak_cats) > 0:
#             new_level = current_level + 1
#             self.db["surveys"].update_one({"userId": str(user_id)}, {"$set": {"level": new_level}})
            
#             # Reset: Purane "read" status ko "read_archived" kar dein taake naye level par count 0 ho jaye
#             self.db.nudge_history.update_many(
#                 {"userId": str(user_id), "action": "read"},
#                 {"$set": {"action": "read_archived"}}
#             )
#             print(f"✅ Level Upgraded to {new_level}! Mastery counts reset for new level.")
#         # 30 Days data from Nudge History for record-keeping
# #         history = list(self.db.nudge_history.find({
# #             "userId": str(user_id),
# #             "action": "mark_as_read",
# #             #"timestamp_sent": {"$gt": datetime.utcnow() - timedelta(days=30)}
# #             "timestamp_sent": {"$gt": datetime.utcnow() - timedelta(days=30)}
# #         }))
        
# #         categories_read = {h["category"] for h in history if "category" in h}
        
# #         # Mastery Calculation: Kitne percent weak categories read ho chuki hain
# #         if not weak_cats: return
# #         mastery_percent = (len(categories_read.intersection(weak_cats)) / len(weak_cats)) * 100
        
# #         # Save mastery in stats
# #         self.db.thompson_stats.update_one(
# #             {"userId": str(user_id)}, 
# #             {"$set": {"mastery_percent": mastery_percent}}
# #         )

# #         total_nudges = self.db.nudge_history.count_documents({
# #     "userId": str(user_id),
# #     "timestamp_sent": {"$gt": datetime.utcnow() - timedelta(days=30)} 
# # })
        
# #         if total_nudges >= 10 and (len(history)/total_nudges)*100 >= 80 and mastery_percent >= 80:
# #             new_level = current_level + 1
# #             self.db["surveys"].update_one({"userId": str(user_id)}, {"$set": {"level": new_level}})

#     def generate_final_nudge(self, user_id, nudge_engine, force=False):
#         # 1. Database se details fetch karein
#         user_survey = self.db.surveys.find_one({"userId": str(user_id)})
#         user_data = self.db.users.find_one({"_id": ObjectId(user_id)})
        
#         # Level survey se aur Name users collection se
#         level = user_survey.get("level", 1) if user_survey else 1
#         user_name = user_data.get("name", "User") if user_data else "User"

#         # 2. Frequency check logic
#         freq = self.get_dynamic_frequency(user_id, level)
        
#         if not force:
#             if not self.can_send_nudge(user_id, freq):
#                 print(f"⏳ Gap too small for user {user_id}, skipping...")
#                 return None
#         else:
#             print(f"🚀 Force mode enabled for {user_id}, bypassing gap check.")

#         # 3. Get AI Stats & Select Combo
#         stats = self.get_user_stats(user_id)
#         combo = self.select_best_combo(stats)
        
#         # Nudge Engine se saare possible nudges uthayein (Pass combo for variety)
#         all_possible_nudges = nudge_engine.get_user_nudges(user_id, selected_combo=combo) 
#         exclude_texts = stats.get("sent_nudge_ids", [])
        
#         # Filter logic: Check if nudge text was already sent
#         available_nudges = [n for n in all_possible_nudges if n.get("nudge") not in exclude_texts]

#         if not available_nudges:
#             # Agar user saare nudges dekh chuka hai, toh history reset karein
#             print(f"🔄 User {user_id} has seen all nudges. Resetting history for variety.")
#             self.db.thompson_stats.update_one(
#                 {"userId": str(user_id)},
#                 {"$set": {"sent_nudge_ids": []}}
#             )
#             available_nudges = all_possible_nudges # Reset ke baad saare options dobara available hain
        
#         # Final selection
#         nudge_content = random.choice(available_nudges)

#         if not nudge_content: 
#             print(f"⚠️ No content could be generated for user {user_id}")
#             return None
#         nudge_category = nudge_content.get("category", "Network Security")
#         nudge_id = f"N-{uuid.uuid4().hex[:8].upper()}"
#         #nudge_id = str(ObjectId())
#         current_time = datetime.utcnow()
        
#         # 4. Final History Entry (userName fixed)
#         history_entry = {
#             "userId": str(user_id),
#             "userName": user_name,
#             "nudgeId": nudge_id,
#             "category": nudge_content.get("category"),
#             "nudge_msg": nudge_content.get("nudge"),
#             "combo": combo,
#             "action": "dismissed",
#             "status_label": "sent",
#             "timestamp_sent": current_time,
#             "timestamp_action": None,
#             "is_processed": False
#         }
        
#         # Database updates
#         self.db.nudge_history.insert_one(history_entry)

#         level_name = {1: "Beginner", 2: "Intermediate", 3: "Advanced"}.get(level, "Beginner")
        
#         self.db.thompson_stats.update_one(
#             {"userId": str(user_id)},
#             {
#                 "$push": {"sent_nudge_ids": nudge_content.get("nudge")},
#                 "$set": {
#                     "engine_details.current_level": level_name,
#                     "engine_details.numeric_level": level,
#                     "engine_details.fixed_frequency": f"Every {24/freq:.1f} hours",
#                     "engine_details.current_dynamic_freq": freq,
                    
#                     # Yahan hum poora object bhej rahe hain taake koi field miss na ho
#                     "latest_interaction": {
#                         "nudgeId": nudge_id,
#                         "category": nudge_category, 
#                         "combo": combo,
#                         "last_action": "sent",
#                         "timestamp_received": current_time, # Jab nudge bheja gaya
#                         "timestamp_action": datetime.utcnow()
#                     }
#                 }
#             }
#         )
#         return {
#             "nudgeId": nudge_id,
#             "nudge_content": [nudge_content] # Isko list mein rakhein kyunki helper [0] mang raha hai
#         }
#     def get_dynamic_frequency(self, user_id, base_level):
#      stats = self.get_user_stats(user_id)
    
#     # 1. Normal Frequency (Level 1: 8, Level 2: 6, Level 3: 4)
#      config = {1: 8, 2: 6, 3: 4}
#      freq = config.get(base_level, 8)
    
#     # 2. 3-Day Dismissal Rule (Least Limits: L1:3, L2:5, L3:6)
#      if stats.get("negative_behavior_days", 0) >= 3:
#            min_limits = {1: 6, 2: 4, 3: 2}
#            freq = min_limits.get(base_level, freq)
        
#      return freq
#     def can_send_nudge(self, user_id, frequency):
#         # 1. Pichla record check karo
#         last_nudge = self.db.nudge_history.find_one(
#             {"userId": str(user_id)}, sort=[("timestamp_sent", -1)]
#         )

#         # 2. Signup Case (Forceful)
#         if not last_nudge:
#             return True 

#         # 3. Time calculation
#         last_time = last_nudge.get("timestamp_sent") or last_nudge.get("timestamp_sent")
#         if not last_time: 
#             return True
        
#         time_since_last = datetime.utcnow() - last_time
#         interval_hours = 24 / frequency

#         # 4. Normal Interval Logic
#         if time_since_last >= timedelta(hours=interval_hours):
#             return True
        
#         return False
#     # def can_send_nudge(self, user_id, frequency): 
#     #    last_nudge = self.db.nudge_history.find_one(
#     #    {"userId": str(user_id)}, 
#     #     sort=[("timestamp", -1)]
#     # )   
#     #    if not last_nudge:
#     #     return True 

#     # # 3. TIME CALCULATION:
#     # # Pichle nudge ka time nikaalein (sent time ya creation time)
#     # last_time = last_nudge.get("timestamp_sent") or last_nudge.get("timestamp")
#     # if not last_time: 
#     #        return True
        
#     # time_since_last = datetime.utcnow() - last_time
#     # interval_hours = 24 / frequency
    
#     # if time_since_last >= timedelta(hours=interval_hours):
#     #     return True
    
#     # # Gap abhi poora nahi hua, isliye nudge nahi jayega
#     #     return False  
#     def sync_ignored_nudges(self):
       
#         # 1. Time threshold set karein (24 ghante purane records)
#         threshold_time = datetime.utcnow() - timedelta(hours=24)
        
#         # 2. Query: Sirf wo records jo 'sent' hain, process nahi hue aur purane hain
#         query = {
#             "status_label": "sent",
#             "is_processed": False,
#             "timestamp_sent": {"$lt": threshold_time}
#         }

#         # 3. Ignored records fetch karein
#         ignored_nudges = list(self.db.nudge_history.find(query))

#         if not ignored_nudges:
#             return 0

#         # 4. Loop ke zariye AI ko train karein ke ye nudges ignore ho chuke hain
#         for nudge in ignored_nudges:
#             # update_user_behavior khud hi inka Beta +1 kar dega
#             self.update_user_behavior(
#                 user_id=nudge["userId"],
#                 combo=nudge["combo"],
#                 action="dismissed", # Ignore ko dismissed hi mana jata hai
#                 nudge_id=nudge["nudgeId"]
#             )
#         self.db.nudge_history.update_many(
#             {
#                 "status_label": "sent", 
#                 "is_processed": False, 
#                 "timestamp_sent": {"$lt": threshold_time}
#             },
#             {
#                 "$set": {
#                     "is_processed": True, 
#                     "status_label": "ignored_sync",
#                     "action": "dismissed" 
#                 }
#             }
#         )
#         print(f"✅ Synced {len(ignored_nudges)} ignored nudges. Beta updated for these users.")
#         return len(ignored_nudges)      




import random
import numpy as np
from datetime import datetime, timedelta
from bson import ObjectId
import uuid
from collections import Counter

class ThompsonNudgeEngine:
    def __init__(self, db):
        self.db = db
        self.decay_factor = 0.95
        self.arms = {
            "length": ["short", "medium", "long"],
            "tone": ["friendly", "warning", "motivational"],
            "complexity": ["simple", "moderate", "technical"],
            "type": ["tip", "education", "alert"],
            "personalization": ["general", "personalized"]
        }

    # ---------------------------------------------------------
    # memory initialization (AI Brain Memory)
    # ---------------------------------------------------------
    def get_user_stats(self, user_id):
        stats = self.db.thompson_stats.find_one({"userId": str(user_id)})
        
        if not stats:
            stats = {
                "userId": str(user_id),
                "dimensions": {}, 
                "sent_nudge_ids": [], # Taake repeat na ho
                # "dismiss_streak": 0,  # Frequency control ke liye
                # "mastered_categories_count": 0,
                # "current_dynamic_freq": 8 # Default freq
                "negative_behavior_days": 0, # Frequency control ke liye (NEW)
                "last_behavior_date": None
            }
            for dim, options in self.arms.items():
                stats["dimensions"][dim] = {opt: {"alpha": 1, "beta": 1} for opt in options}
            #self.db.thompson_stats.insert_one(stats)
            self.db.thompson_stats.insert_one(stats)
        return stats
    def select_best_combo(self, stats):
        selected_combo = {}
        all_dims = list(stats["dimensions"].keys())
        num_to_select = random.randint(2, len(all_dims)) 
        chosen_dims = random.sample(all_dims, num_to_select)

        for dim in chosen_dims:
            options = stats["dimensions"][dim]
            best_sample = -1
            best_arm = None
            for arm_name, values in options.items():
                sample = np.random.beta(values["alpha"], values["beta"])
                if sample > best_sample:
                    best_sample = sample
                    best_arm = arm_name
            
            # ✅ Ye line ab sahi jagah par hai (inner loop ke bahar)
            selected_combo[dim] = best_arm

        return selected_combo
    # ---------------------------------------------------------
    # ADAPT BEHAVIOR: Training Logic
    # ---------------------------------------------------------
    def update_user_behavior(self, user_id, combo, action, nudge_id=None):
        if action == "sent":
            return

        stats = self.get_user_stats(user_id)
        # "read" aur "mark_as_read" dono ko success maanein
        success = 1 if action in ["mark_as_read", "read"] else 0
        
        # --- 3-Day Observation & 4-Success Streak Logic ---
        current_date = datetime.utcnow().date()
        last_date = stats.get("last_behavior_date")
        neg_days = stats.get("negative_behavior_days", 0)
        success_streak = stats.get("consecutive_success_count", 0)

        if success:
            success_streak += 1
            # Agar lagataar 4 baar success ho jaye toh penalty khatam (neg_days reset)
            if success_streak >= 4:
                neg_days = 0
                success_streak = 0
        else:
            # Penalty logic: Success streak toot gayi
            success_streak = 0
            if last_date and str(last_date) != str(current_date):
                neg_days += 1 

        # --- Thompson Sampling Training ---
        dimensions = stats["dimensions"]
        for dim, selected_arm in combo.items():
            for arm in dimensions[dim]:
                dimensions[dim][arm]["alpha"] *= self.decay_factor
                dimensions[dim][arm]["beta"] *= self.decay_factor
            
            if success:
                dimensions[dim][selected_arm]["alpha"] += 1
            else:
                dimensions[dim][selected_arm]["beta"] += 1
        all_history = list(self.db.nudge_history.find({"userId": str(user_id)}))
        total_sent = len(all_history)
        reads = sum(1 for n in all_history if n.get("action") == "read")
        dismisses = sum(1 for n in all_history if n.get("action") == "dismissed")
        from collections import Counter
        current_level_reads = [h["category"] for h in all_history if h.get("action") == "read"]
        read_counts = Counter(current_level_reads)
        mastered_at_this_level = [cat for cat, count in read_counts.items() if count >= 100]

# 3. Latest Nudge Details for UI
        last_nudge = self.db.nudge_history.find_one({"userId": str(user_id)}, sort=[("timestamp_sent", -1)])
        target_action = "read" if success else "dismissed"

        
        # 1. Update Thompson Stats
        self.db.thompson_stats.update_one(
            {"userId": str(user_id)},
            {"$set": {
                "nudge_stats": {
                    "total_sent": total_sent,
                    "read_count": reads,
                    "dismiss_count": dismisses,
                    "read_rate": f"{(reads/total_sent)*100:.1f}%" if total_sent > 0 else "0%",
                    "dismiss_rate": f"{(dismisses/total_sent)*100:.1f}%" if total_sent > 0 else "0%",
                    "dismiss_streak": neg_days
                },
                # Engine details generate_final_nudge se update ho chuki hongi, yahan improve_category add karein
                "engine_details.improve_category": combo.get("category", "General"),
                #"engine_details.mastered_categories": list({n["category"] for n in all_history if n.get("action") == "read"}),
                "engine_details.mastered_categories": mastered_at_this_level,
                "engine_details.negative_behavior_days": neg_days,         
                "engine_details.consecutive_success_count": success_streak, 
                "engine_details.last_behavior_date": str(current_date),                 
                "latest_interaction": {
                    "nudgeId": str(nudge_id),
                    "category": combo.get("category"),
                    "combo": combo,
                    "last_action": target_action,
                    "timestamp_received": last_nudge.get("timestamp_sent") if last_nudge else None,
                    "timestamp_action": datetime.utcnow()
                },
                
                "dimensions": dimensions
                },
                "$unset": 
                {    "negative_behavior_days": "", 
                    "consecutive_success_count": "",
                    "last_behavior_date": ""
                }
            },
            
            
            upsert=True
        )

        # 2. FIX: Nudge History Update
        if not nudge_id:
            return

        # User data fetch for name
        user_data = self.db.users.find_one({"_id": ObjectId(user_id)})
        current_user_name = user_data.get("name", "Unknown") if user_data else "Unknown"
        
        target_action = "read" if success else "dismissed"
        
        # Database update with all fields
        update_result = self.db.nudge_history.update_one(
            {
                "userId": str(user_id), 
                "nudgeId": str(nudge_id), 
                "is_processed": False
            },
            {"$set": {
                "userName": current_user_name,
                #"category": "Network Security",
                "combo": combo,
                "action": target_action,      
                "status_label": "result_recorded", 
                
                "timestamp_action": datetime.utcnow(), 
                "is_processed": True 
            }}
        )

        # Success/Warning logic
        if update_result.modified_count > 0:
            print(f"Success: {current_user_name} - All fields updated including combo")
        else:
            print(f"Warning: No record found for User: {user_id} with Nudge: {nudge_id} and is_processed: False")
        
    # ---------------------------------------------------------
    # LEVEL & FREQUENCY LOGIC
    # ---------------------------------------------------------
    

    def check_and_upgrade_level(self, user_id):
        survey = self.db["surveys"].find_one({"userId": str(user_id)}, sort=[("timestamp", -1)])
        if not survey: return
        
        weak_cats = survey.get("weak_categories", [])
        current_level = survey.get("level", 1)
        if current_level >= 3: return
        read_history = list(self.db.nudge_history.find({"userId": str(user_id), "action": "read"}))
        
        # 2. Har category ke reads count karein
        from collections import Counter
        read_counts = Counter([h["category"] for h in read_history if "category" in h])

        # 3. Mastered categories (Jinke 100 reads pure hain)
        mastered_categories = [cat for cat, count in read_counts.items() if count >= 100]

        # 4. Check: Kya saari weak categories mastered hain?
        all_weak_mastered = all(cat in mastered_categories for cat in weak_cats) if weak_cats else False

        # Stats update karein UI ke liye
        self.db.thompson_stats.update_one(
            {"userId": str(user_id)}, 
            {"$set": {"engine_details.mastered_categories": mastered_categories}}
        )

        # 5. Level Upgrade aur Reset Logic
        if all_weak_mastered and len(weak_cats) > 0:
            new_level = current_level + 1
            self.db["surveys"].update_one({"userId": str(user_id)}, {"$set": {"level": new_level}})
            
            # Reset: Purane "read" status ko "read_archived" kar dein taake naye level par count 0 ho jaye
            self.db.nudge_history.update_many(
                {"userId": str(user_id), "action": "read"},
                {"$set": {"action": "read_archived"}}
            )
            print(f"✅ Level Upgraded to {new_level}! Mastery counts reset for new level.")
    
    
    def generate_final_nudge(self, user_id, nudge_engine, force=False):
        # 1. Database se details fetch
        user_survey = self.db.surveys.find_one({"userId": str(user_id)})
        user_data = self.db.users.find_one({"_id": ObjectId(user_id)})
        
        level = user_survey.get("level", 1) if user_survey else 1
        user_name = user_data.get("name", "User") if user_data else "User"

        # 2. Frequency check
        freq = self.get_dynamic_frequency(user_id, level)
        if not force:
            if not self.can_send_nudge(user_id, freq):
                print(f"⏳ Gap too small for user {user_id}, skipping...")
                return None
        
        # 3. Thompson Selection
        stats = self.get_user_stats(user_id)
        combo = self.select_best_combo(stats) 
        
        # 4. Content Generation (Logic Generator)
        all_possible_nudges = nudge_engine.get_user_nudges(user_id, selected_combo=combo) 
        
        # 5. Repeat Filter & Fix
        exclude_texts = stats.get("sent_nudge_ids", [])
        available_nudges = [n for n in all_possible_nudges if n.get("nudge") not in exclude_texts]

        # --- CRITICAL FIX START ---
        if not available_nudges:
            print(f"🔄 Resetting text history for user {user_id} to avoid empty sequence")
            self.db.thompson_stats.update_one(
                {"userId": str(user_id)},
                {"$set": {"sent_nudge_ids": []}}
            )
            available_nudges = all_possible_nudges 
        # --- CRITICAL FIX END ---

        # 6. Final Choice & Safety Check
        if not available_nudges:
            print(f"⚠️ No nudges available for user {user_id} even after reset.")
            return None

        nudge_content = random.choice(available_nudges)
        nudge_id = f"N-{uuid.uuid4().hex[:8].upper()}"
        current_time = datetime.utcnow()
        
        # 7. History Entry
        history_entry = {
            "userId": str(user_id),
            "userName": user_name,
            "nudgeId": nudge_id,
            "category": nudge_content.get("category"),
            "nudge_msg": nudge_content.get("nudge"),
            "combo": combo,
            "action": "dismissed",
            "status_label": "sent",
            "timestamp_sent": current_time,
            "is_processed": False
        }
        
        self.db.nudge_history.insert_one(history_entry)

        # 8. Thompson Stats Update
        level_map = {1: "Beginner", 2: "Intermediate", 3: "Advanced"}
        level_name = level_map.get(level, "Beginner")
        
        self.db.thompson_stats.update_one(
            {"userId": str(user_id)},
            {
                "$push": {"sent_nudge_ids": nudge_content.get("nudge")},
                "$set": {
                    "engine_details.current_level": level_name,
                    "engine_details.current_dynamic_freq": freq,
                    "latest_interaction": {
                        "nudgeId": nudge_id,
                        "category": nudge_content.get("category"), 
                        "combo": combo,
                        "timestamp_received": current_time
                    }
                }
            }
        )
        
        return {
            "nudgeId": nudge_id,
            "nudge_content": nudge_content 
        }
    def get_dynamic_frequency(self, user_id, base_level):
     stats = self.get_user_stats(user_id)
    
    # 1. Normal Frequency (Level 1: 8, Level 2: 6, Level 3: 4)
     config = {1: 8, 2: 6, 3: 4}
     freq = config.get(base_level, 8)
    
    # 2. 3-Day Dismissal Rule (Least Limits: L1:3, L2:5, L3:6)
     if stats.get("negative_behavior_days", 0) >= 3:
           min_limits = {1: 6, 2: 5, 3: 2}
           freq = min_limits.get(base_level, freq)
        
     return freq

    # def can_send_nudge(self, user_id, frequency):
    #     # 1. Pichla record check karo
    #     last_nudge = self.db.nudge_history.find_one(
    #         {"userId": str(user_id)}, sort=[("timestamp_sent", -1)]
    #     )

        
        

    #     # 3. Time calculation
    #     last_time = last_nudge.get("timestamp_sent") or last_nudge.get("timestamp_sent")
    #     if not last_nudge:
    #     # Trigger ko block kar dein kyunki pehla nudge Forcefully bhejna hai
    #         print(f"⏳ Trigger waiting: First nudge must be forceful for user {user_id}")
    #     return False

    #     last_time = last_nudge.get("timestamp_sent")
        # time_since_last = datetime.utcnow() - last_time
        # interval_hours = 24 / frequency

        # # 4. Normal Interval Logic
        # if time_since_last >= timedelta(hours=interval_hours):
        #     return True
        
        # return False

    def can_send_nudge(self, user_id, frequency):
        # 1. Sabse pehle check karein ke kya koi nudge pehle gaya hai?
        last_nudge = self.db.nudge_history.find_one(
            {"userId": str(user_id)}, 
            sort=[("timestamp_sent", -1)]
        )

        # 🛑 CASE 1: Agar koi nudge nahi gaya (Naya User)
        if not last_nudge:
            # Trigger ko block kar dein kyunki pehla nudge Forcefully bhejna hai
            print(f"⏳ Trigger waiting: First nudge must be forceful for user {user_id}")
            return False 

        # 🛑 CASE 2: Agar pehla (Forceful) nudge ja chuka hai
        last_time = last_nudge.get("timestamp_sent")
        time_since_last = datetime.utcnow() - last_time

        # Frequency ke mutabiq gap calculate karein (e.g., 24/8 = 3 hours)
        interval_hours = 24 / frequency 
        
        # Check karein ke kya itna time guzar chuka hai?
        if time_since_last >= timedelta(hours=interval_hours):
            return True
        
        # Agar waqt poora nahi hua toh False
        return False
    # Agar waqt poora nahi hua toh False
    
        # def can_send_nudge(self, user_id, frequency): 
    #    last_nudge = self.db.nudge_history.find_one(
    #    {"userId": str(user_id)}, 
    #     sort=[("timestamp", -1)]
    # )   
    #    if not last_nudge:
    #     return True 

    # # 3. TIME CALCULATION:
    # # Pichle nudge ka time nikaalein (sent time ya creation time)
    # last_time = last_nudge.get("timestamp_sent") or last_nudge.get("timestamp")
    # if not last_time: 
    #        return True
        
    # time_since_last = datetime.utcnow() - last_time
    # interval_hours = 24 / frequency
    
    # if time_since_last >= timedelta(hours=interval_hours):
    #     return True
    
    # # Gap abhi poora nahi hua, isliye nudge nahi jayega
    #     return False  
    def sync_ignored_nudges(self):
       
        # 1. Time threshold set karein (24 ghante purane records)
        threshold_time = datetime.utcnow() - timedelta(hours=24)
        
        # 2. Query: Sirf wo records jo 'sent' hain, process nahi hue aur purane hain
        query = {
            "status_label": "sent",
            "is_processed": False,
            "timestamp_sent": {"$lt": threshold_time}
        }

        # 3. Ignored records fetch karein
        ignored_nudges = list(self.db.nudge_history.find(query))

        if not ignored_nudges:
            return 0

        # 4. Loop ke zariye AI ko train karein ke ye nudges ignore ho chuke hain
        for nudge in ignored_nudges:
            # update_user_behavior khud hi inka Beta +1 kar dega
            self.update_user_behavior(
                user_id=nudge["userId"],
                combo=nudge["combo"],
                action="dismissed", # Ignore ko dismissed hi mana jata hai
                nudge_id=nudge["nudgeId"]
            )
        self.db.nudge_history.update_many(
            {
                "status_label": "sent", 
                "is_processed": False, 
                "timestamp_sent": {"$lt": threshold_time}
            },
            {
                "$set": {
                    "is_processed": True, 
                    "status_label": "ignored_sync",
                    "action": "dismissed" 
                }
            }
        )
        print(f"✅ Synced {len(ignored_nudges)} ignored nudges. Beta updated for these users.")
        return len(ignored_nudges)