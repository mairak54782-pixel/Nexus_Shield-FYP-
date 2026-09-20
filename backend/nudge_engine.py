# import random
# from bson import ObjectId

# class DynamicNudgeEngine:
#     def __init__(self, db):
#         self.db = db
#         self.knowledge_base = {
#     "Password Security": {
#         "actions": ["using a password manager", "enabling 2FA", "setting unique passwords"],
#         "risks": ["credential stuffing", "brute-force attacks"]
#     },
#     "Device Security": {
#         "actions": ["locking your screen with biometrics", "setting a complex PIN"],
#         "risks": ["unauthorized physical access", "data misuse from lost devices"]
#     },
#     "Phishing": {
#         "actions": ["verifying sender email addresses", "not clicking unknown links"],
#         "risks": ["identity theft", "credential harvesting"]
#     },
#     "Physical Security": {
#         "actions": ["shielding your screen in public", "never leaving devices unattended"],
#         "risks": ["shoulder surfing", "theft of hardware"]
#     },
#     "Network Security": {
#         "actions": ["avoiding public Wi-Fi for banking", "using a trusted VPN"],
#         "risks": ["man-in-the-middle attacks", "packet sniffing"]
#     },
#     "Software Updates": {
#         "actions": ["enabling automatic OS updates", "patching apps immediately"],
#         "risks": ["zero-day exploits", "vulnerable software patches"]
#     },
#     "Malware Protection": {
#         "actions": ["running regular antivirus scans", "avoiding suspicious downloads"],
#         "risks": ["ransomware encryption", "spyware"]
#     },
#     "App Security": {
#         "actions": ["reviewing app permissions", "downloading only from official stores"],
#         "risks": ["malicious background processes", "data over-collection"]
#     },
#     "Web Security": {
#         "actions": ["checking for HTTPS lock icons", "clearing browser cookies"],
#         "risks": ["cross-site tracking", "fake websites"]
#     }
# }

#     def get_user_nudges(self, user_id):
#         try:
#             # 1. Database se user ka latest survey aur level fetch karna
#             survey = self.db["surveys"].find_one(
#                 {"userId": str(user_id)}, 
#                 sort=[("timestamp", -1)] 
#             )

#             if not survey or not survey.get("weak_categories"):
#                 return [{
#                     "category": "General", 
#                     "nudge": "Keep practicing good cyber hygiene! You're doing great."
#                 }]

#             weak_cats = survey["weak_categories"]
#             user_level = survey.get("level", 1) # User ka level (1, 2, ya 3)
#             generated_nudges = []

#             for cat in weak_cats:
#                 if cat in self.knowledge_base:
#                     action = random.choice(self.knowledge_base[cat]["actions"])
#                     risk = random.choice(self.knowledge_base[cat]["risks"])
                    
#                     # ---------------------------------------------------------
#                     # LOGIC: LEVEL-WISE DYNAMIC TEMPLATES
#                     # ---------------------------------------------------------
#                     if user_level == 1:
#                         # Level 1: Simple advice for beginners
#                         msg = f"Tip for {cat}: Try {action} to stay safe from {risk}."
#                     elif user_level == 2:
#                         # Level 2: More serious tone for intermediate users
#                         msg = f"Improve your {cat}: By {action}, you can effectively block {risk}."
#                     else:
#                         # Level 3: Professional/Technical tone for experts
#                         msg = f"Security Optimization: {action} is critical to mitigate {risk} in {cat}."
                    
#                     generated_nudges.append({
#                         "category": cat,
#                         "nudge": msg
#                     })

#             if not generated_nudges:
#                  return [{"category": "General", "nudge": "Stay safe and keep your software updated!"}]

#             return generated_nudges

#         except Exception as e:
#             print(f"❌ Nudge Engine Error: {str(e)}")
#             return [{"category": "General", "nudge": "Stay safe and keep your software updated!"}]
#     # Purane function ke niche ye naya function add karein
#     async def get_filtered_nudge(self, user_id, exclude_ids=[]):
#         # 1. User ka latest survey se weak categories nikalna
#         survey = self.db["surveys"].find_one({"userId": str(user_id)}, sort=[("timestamp", -1)])
#         weak_cats = survey.get("weak_categories", []) if survey else []

#         # 2. Database query: Sirf weak categories hon aur wo IDs na hon jo pehle bhej di hain ($nin)
#         query = {
#             "category": {"$in": weak_cats},
#             "_id": {"$nin": [ObjectId(i) for i in exclude_ids if i]}
#         }

#         # 3. Database se nudges ki list nikal kar koi ek random select karna
#         nudges = list(self.db["nudges"].find(query))
#         return random.choice(nudges) if nudges else None  




import random
from bson import ObjectId

class DynamicNudgeEngine:
    def __init__(self, db):
        self.db = db
        # 1. Knowledge Base (Saari 9 Categories)
        self.knowledge_base = {
            "Password Security": {
                "actions": ["using a password manager", "enabling 2FA", "setting unique passwords", "using passkeys", "rotating credentials"],
                "risks": ["credential stuffing", "brute-force attacks", "identity theft", "account takeover"]
            },
            "Device Security": {
                "actions": ["locking your screen with biometrics", "setting a complex PIN", "enabling remote wipe", "updating lock screen patterns"],
                "risks": ["unauthorized physical access", "data misuse from lost devices", "theft of information"]
            },
            "Phishing": {
                "actions": ["verifying sender email addresses", "not clicking unknown links", "reporting suspicious emails", "checking URL spellings"],
                "risks": ["identity theft", "credential harvesting", "malicious redirects"]
            },
            "Physical Security": {
                "actions": ["shielding your screen in public", "never leaving devices unattended", "using privacy filters", "locking your office desk"],
                "risks": ["shoulder surfing", "theft of hardware", "visual hacking"]
            },
            "Network Security": {
                "actions": ["avoiding public Wi-Fi for banking", "using a trusted VPN", "changing default router passwords", "disabling auto-connect"],
                "risks": ["man-in-the-middle attacks", "packet sniffing", "unsecured hotspots"]
            },
            "Software Updates": {
                "actions": ["enabling automatic OS updates", "patching apps immediately", "reviewing update logs", "removing outdated software"],
                "risks": ["zero-day exploits", "vulnerable software patches", "system instability"]
            },
            "Malware Protection": {
                "actions": ["running regular antivirus scans", "avoiding suspicious downloads", "checking file extensions", "using sandboxed browsers"],
                "risks": ["ransomware encryption", "spyware", "trojan horse attacks"]
            },
            "App Security": {
                "actions": ["reviewing app permissions", "downloading only from official stores", "deleting unused apps", "limiting background data"],
                "risks": ["malicious background processes", "data over-collection", "privacy leaks"]
            },
            "Web Security": {
                "actions": ["checking for HTTPS lock icons", "clearing browser cookies", "using incognito for sensitive tasks", "blocking pop-ups"],
                "risks": ["cross-site tracking", "fake websites", "session hijacking"]
            }
        }

    def get_user_nudges(self, user_id, selected_combo={}):
        try:
            # 1. User Info & Level fetch karna
            survey = self.db["surveys"].find_one({"userId": str(user_id)}, sort=[("timestamp", -1)])
            
            if not survey:
                weak_cats = list(self.knowledge_base.keys())
                user_level = 1
            else:
                weak_cats = survey.get("weak_categories", list(self.knowledge_base.keys()))
                user_level = survey.get("level", 1)
            
            # 2. Dimensions from Thompson
            tone = selected_combo.get("tone", "friendly")
            n_type = selected_combo.get("type", "tip")

            generated_nudges = []

            for cat in weak_cats:
                if cat in self.knowledge_base:
                    action = random.choice(self.knowledge_base[cat]["actions"])
                    risk = random.choice(self.knowledge_base[cat]["risks"])
                    
                    # --- DYNAMIC STARTERS (Level-wise & Tone-wise) ---
                    if user_level >= 3:
                        starters = [
                            f"Professional standards dictate that in {cat}",
                            f"Strategic risk reduction for {cat} involves",
                            f"To minimize the attack surface of your {cat}",
                            f"It is critical for system integrity that"
                        ]
                    elif tone == "warning" or n_type == "alert":
                        starters = [
                            f"Please be cautious because your {cat}",
                            f"This is an important update regarding your {cat}",
                            f"Security is at risk unless your {cat}",
                            f"Immediate attention is needed for {cat}"
                        ]
                    else: # Friendly/Motivational
                        starters = [
                            f"A great way to improve your {cat} is when",
                            f"You can stay much safer if",
                            f"One easy step for your {cat} is that",
                            f"It is a smart idea when"
                        ]
                    
                    starter = random.choice(starters)

                    # --- DYNAMIC BODIES (Grammar & Complexity) ---
                    if user_level >= 3:
                        bodies = [
                            f" you enforce {action} to mitigate {risk}",
                            f" {action} is mandated to eliminate {risk} exposure",
                            f" you deploy {action} against {risk} vectors"
                        ]
                    elif user_level == 2:
                        bodies = [
                            f" you utilize {action} to neutralize {risk}",
                            f" {action} is implemented to protect against {risk}",
                            f" you prioritize {action} to reduce {risk}"
                        ]
                    else: # Level 1
                        bodies = [
                            f" you start {action} to stop {risk}",
                            f" {action} helps you avoid {risk}",
                            f" you focus on {action} to stay safe from {risk}"
                        ]
                    
                    body = random.choice(bodies)

                    # --- FINAL ASSEMBLY (Smooth & Clean) ---
                    msg = f"{starter}{body}."
                    
                    generated_nudges.append({"category": cat, "nudge": msg})

            return generated_nudges

        except Exception as e:
            print(f"❌ Error: {str(e)}")
            return [{"category": "General", "nudge": "Please ensure your apps are updated for better security."}]

    async def get_filtered_nudge(self, user_id, exclude_ids=[]):
        survey = self.db["surveys"].find_one({"userId": str(user_id)}, sort=[("timestamp", -1)])
        weak_cats = survey.get("weak_categories", []) if survey else []

        query = {
            "category": {"$in": weak_cats},
            "_id": {"$nin": [ObjectId(i) for i in exclude_ids if i]}
        }

        nudges = list(self.db["nudges"].find(query))
        #return random.choice(nudges) if nudges else None
        return random.choice(nudges) if nudges else {"category": "General", "nudge": "Keep your device secure by updating your software regularly."}