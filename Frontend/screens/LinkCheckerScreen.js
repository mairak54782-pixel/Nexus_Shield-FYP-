import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../context/ThemeContext";
import { BASE_URL } from "../config";

export default function LinkCheckerScreen({ navigation }) {
  const { theme, isDark } = useTheme();
  const [url, setUrl] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const checkLink = async () => {
    if (!url.trim()) {
      setResult({ label: "ERROR: Enter URL" });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const storedUserId = await AsyncStorage.getItem("userId");
      const storedUserName = await AsyncStorage.getItem("userName");

      console.log(`📤 Connecting to: ${BASE_URL}/predict`);

      const response = await fetch(`${BASE_URL}/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: url.trim(),
          user_id: storedUserId,
          user_name: storedUserName || "User"
        }),
      });

      const data = await response.json();
      console.log("✅ Response:", data);
      setResult(data);
    } catch (error) {
      console.log("❌ ERROR:", error);
      setResult({
        label: "ERROR: Server not reachable"
      });
    }
    setLoading(false);
  };

  return (
    <LinearGradient colors={theme.gradient} style={styles.container}>
      <StatusBar barStyle={theme.statusBar} />
      <KeyboardAvoidingView
        style={styles.innerContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Back button - matches TrainingLessonScreen style */}
        <TouchableOpacity
          style={[
            styles.backButton,
            { backgroundColor: theme.card, borderColor: theme.cardBorder }
          ]}
          onPress={() => navigation.navigate("MainTabs")}
        >
          <Ionicons name="arrow-back" size={22} color={theme.text} />
        </TouchableOpacity>

        {/* Content container */}
        <View style={styles.contentContainer}>
          <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <Text style={[styles.title, { color: theme.text }]}>🔗 Link Checker</Text>
            <Text style={[styles.subtitle, { color: theme.placeholder }]}>
              Paste a link below to check if it's safe
            </Text>

            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.inputBg,
                  color: theme.text,
                  borderColor: theme.border,
                  placeholderTextColor: theme.placeholder,
                }
              ]}
              placeholder="https://google.com"
              placeholderTextColor={theme.placeholder}
              value={url}
              onChangeText={setUrl}
              autoCapitalize="none"
              keyboardType="url"
            />

            <TouchableOpacity
              style={[
                styles.button,
                { backgroundColor: theme.accent },
                loading && styles.buttonDisabled
              ]}
              onPress={checkLink}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? "Checking..." : "Check Link"}
              </Text>
            </TouchableOpacity>

            {result && (
              <View style={[styles.resultBox, { backgroundColor: theme.inputBg }]}>
                <Text
                  style={[
                    styles.resultLabel,
                    result.label?.includes("SAFE")
                      ? styles.safeText
                      : result.label?.includes("PHISHING")
                      ? styles.phishingText
                      : styles.cautionText,
                  ]}
                >
                  {result.label || "Unknown"}
                </Text>
                <Text style={[styles.debugText, { color: theme.placeholder }]}>
                  {/* optional debug info */}
                </Text>
              </View>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1,
    zIndex: 10,
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  card: {
    width: "100%",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    textAlign: "center",
  },
  subtitle: {
    textAlign: "center",
    marginBottom: 15,
  },
  input: {
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 15,
    borderWidth: 1,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
    textAlign: "center",
  },
  resultBox: {
    marginTop: 20,
    padding: 15,
    borderRadius: 10,
  },
  resultLabel: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 6,
    textAlign: "center",
  },
  debugText: {
    fontSize: 10,
    textAlign: "center",
    marginTop: 10,
  },
  safeText: {
    color: "#4ade80",
  },
  phishingText: {
    color: "#f87171",
  },
  cautionText: {
    color: "#fbbf24",
  },
});