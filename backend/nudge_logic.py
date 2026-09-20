# import numpy as np
# from datetime import datetime, timedelta

# # 1. 20 Categories List
# CATEGORIES = [
#     "Passwords", "Phishing", "Public WiFi", "Two-Factor Auth", "Software Updates",
#     "Social Media Privacy", "Mobile Security", "Data Backup", "Email Security", "Web Browsing",
#     "Physical Security", "IoT Devices", "Cloud Storage", "Identity Theft", "Malware Awareness",
#     "Encryption", "Online Shopping", "App Permissions", "Network Security", "Device Disposal"
# ]

# # 2. Initial Stats for New Users
# def get_initial_nudge_stats():
#     # Har category ko 1 alpha aur 1 beta dena zaroori hai
#     return {cat: {"alpha": 1, "beta": 1} for cat in CATEGORIES}

# # 3. ✅ SAFE Thompson Sampling: Best Category Picker
# def select_best_category(user_stats):
#     # 🛡️ SAFETY CHECK: Agar DB se stats nahi miley (NoneType) toh crash na ho
#     if not user_stats:
#         print("⚠️ Warning: No user_stats found for this ID, falling back to Passwords")
#         return "Passwords"
        
#     best_category = None
#     max_prob = -1
    
#     # User ke har category ke stats par loop chalayein
#     for cat, val in user_stats.items():
#         # Safety defaults agar alpha ya beta field missing ho
#         alpha = val.get('alpha', 1)
#         beta = val.get('beta', 1)
        
#         # Thompson Sampling Calculation (Beta Distribution)
#         prob = np.random.beta(alpha, beta)
        
#         if prob > max_prob:
#             max_prob = prob
#             best_category = cat
            
#     return best_category

# # 4. Time & Gap Checker (9 AM - 10 PM Rule)
# # ✅ YE NAYA FUNCTION YAHAN LIKHEIN
# def is_it_time_to_send(user):
#     # 1. Database se zaroori data uthayein
#     last_sent_at = user.get("last_nudge_sent_at")
    
#     # User level ke mutabiq frequency nikaalein (8, 6, ya 4)
#     # Agar field missing ho toh 4 default rakhein
#     daily_frequency = user.get("daily_frequency", 4) 
    
#     # 2. Agar user ko pehle kabhi nudge nahi bheja (Naya user hai)
#     if last_sent_at is None:
#         return True

#     # 3. Gap calculate karein
#     # Maslan: 8 nudges = har 3 ghante baad gap (24/8 = 3)
#     required_gap_hours = 24 / daily_frequency
    
#     now = datetime.utcnow()
    
#     # Check karein ke last nudge sent time se ab tak kitna gap hai
#     time_diff = now - last_sent_at

#     if time_diff >= timedelta(hours=required_gap_hours):
#         return True
    
#     return False
# # 5. Weekly Adaptive Frequency Logic
# def adjust_frequency(current_level, success_rate):
#     # Success rate < 40% toh frequency kam kar do
#     if success_rate < 0.4:
#         low_freq = {1: 5, 2: 4, 3: 2}
#         return low_freq.get(current_level, 5)
    
#     # Normal Frequency
#     gen_freq = {1: 8, 2: 6, 3: 4}
#     return gen_freq.get(current_level, 8)   