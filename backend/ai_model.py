"""
ai_model.py
-------------
Loads the trained CNN phishing-detection model and its tokenizer, then
classifies URLs as safe, suspicious, or phishing.

The raw sigmoid output is temperature-calibrated so the confidence scores
aren't overconfident, and URL entropy is used as a secondary signal before
flagging something as outright phishing.
"""

import os
import math
import pickle
from collections import Counter

import tensorflow as tf
from tensorflow.keras.preprocessing.sequence import pad_sequences

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MAX_LEN = 200
TEMPERATURE = 4.0

MODEL_PATH = os.path.join(BASE_DIR, "model", "cnn_url_phishing_final.keras")
TOKENIZER_PATH = os.path.join(BASE_DIR, "model", "tokenizer.pkl")

try:
    model = tf.keras.models.load_model(MODEL_PATH)
    with open(TOKENIZER_PATH, "rb") as f:
        tokenizer = pickle.load(f)
    print("✅ Phishing detection model and tokenizer loaded")
except Exception as e:
    print(f"❌ Model load failed: {e}")
    model = None
    tokenizer = None


def url_entropy(url: str) -> float:
    """Shannon entropy of the URL string - random-looking URLs score higher."""
    counts = Counter(url)
    total = len(url)
    return -sum((c / total) * math.log2(c / total) for c in counts.values())


def calibrated_prob(p: float, T: float = TEMPERATURE) -> float:
    """Temperature scaling to soften overconfident model outputs."""
    if p <= 0 or p >= 1:
        return p
    return 1 / (1 + math.exp(-math.log(p / (1 - p)) / T))


def predict_url(url: str) -> dict:
    """Classify a URL and return a label with its calibrated probability."""
    if model is None or tokenizer is None:
        return {
            "label": "⚠️ MODEL NOT LOADED",
            "probability": 0.5,
            "error": "Model not loaded",
        }

    try:
        seq = tokenizer.texts_to_sequences([url])
        padded = pad_sequences(seq, maxlen=MAX_LEN)

        raw_prob = model.predict(padded, verbose=0)[0][0]
        prob = calibrated_prob(raw_prob)
        entropy = url_entropy(url)

        if prob <= 0.20:
            label = "✅ SAFE"
        elif prob >= 0.90 and entropy > 4.0:
            label = "🚨 PHISHING (Unsafe)"
        else:
            label = "⚠️ POTENTIALLY UNSAFE – PROCEED WITH CAUTION"

        return {"label": label, "probability": float(prob)}

    except Exception as e:
        return {"label": "❌ ERROR", "probability": 0.5, "error": str(e)}