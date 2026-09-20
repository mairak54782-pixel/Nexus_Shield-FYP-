import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { useTheme } from "../context/ThemeContext";
import { BASE_URL } from '../config';
  ? "http://localhost:8000" 
  : "${BASE_URL}";

const TrainingLessonScreen = ({ navigation }) => {
  const { theme, isDark } = useTheme();
  const [level, setLevel] = useState(1);
  const [loading, setLoading] = useState(false);

  // Hardcoded topics (same as before)
  const HARDCODED_TOPICS = {
    1: ["Phishing Awareness",
        "Password Security",
        "Public WiFi Risks",
        "Social Engineering",
        "Two-Factor Authentication", 
        "Safe Browsing",
        "Mobile App Permissions",
        "Physical Security"],
    2: ["SQL Injection", 
        "Cross-Site Scripting (XSS)", 
        "Man-in-the-Middle", 
        "Network Firewalls", 
        "VPN Technology", 
        "Encryption Basics", 
        "Brute Force Attacks",
        "Malware Types"],
    3: ["Zero-Day Vulnerabilities",
        "Ransomware Defense",
        "Cloud Security",
        "Incident Response",
        "Penetration Testing",
        "Ethical Hacking",
        "Digital Forensics", 
        "Dark Web Monitoring"]
  };

  const handleTopicPress = async (topicTitle) => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/get-content`, {
        params: { topic: topicTitle, level: level }
      });
      if (res.data && res.data.flashcards && res.data.flashcards.length > 0) {
        navigation.navigate("FlashCard", { 
          lesson: res.data, 
          topic: topicTitle, 
          level: level 
        });
      } else {
        Alert.alert("Data Not Found", `'${topicTitle}' content not available.`);
      }
    } catch (err) {
      console.log("Fetch Error:", err);
      Alert.alert("Error", "Server connection failed! Make sure your FastAPI server is running.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <LinearGradient colors={theme.gradient} style={styles.container}>
        <StatusBar barStyle={theme.statusBar} />
        <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={theme.accent} />
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={theme.gradient} style={styles.container}>
      <StatusBar barStyle={theme.statusBar} />
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={[styles.backButton, { backgroundColor: theme.card }]} 
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={22} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerText, { color: theme.text }]}>Training Topics</Text>
        </View>
        
        {/* Topics List */}
        <FlatList
          data={HARDCODED_TOPICS[level]}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={[styles.lessonBox, { backgroundColor: theme.card, borderColor: theme.cardBorder }]} 
              onPress={() => handleTopicPress(item)}
            >
              <Ionicons name="shield-checkmark-outline" size={22} color={theme.accent} style={{marginRight: 10}} />
              <Text style={[styles.lessonText, { color: theme.text }]}>{item}</Text>
              <Ionicons name="chevron-forward" size={18} color={theme.accent} style={{marginLeft: 'auto'}} />
            </TouchableOpacity>
          )}
        />

        {/* Level Navigation */}
        <View style={styles.bottomNav}>
          <TouchableOpacity 
            style={[styles.navBtn, { backgroundColor: theme.accent, opacity: level === 1 ? 0.5 : 1 }]} 
            onPress={() => level > 1 && setLevel(level - 1)}
            disabled={level === 1}
          >
            <Text style={styles.navText}>Prev</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.navBtn, { backgroundColor: theme.accent, opacity: level === 3 ? 0.5 : 1 }]} 
            onPress={() => level < 3 && setLevel(level + 1)}
            disabled={level === 3}
          >
            <Text style={styles.navText}>Next</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20, 
    paddingTop: 60,
  },
  header: { 
    flexDirection: "row", 
    alignItems: "center", 
    marginBottom: 20 
  },
  backButton: { 
    width: 40, 
    height: 40, 
    justifyContent: "center", 
    alignItems: "center", 
    borderRadius: 10, 
    marginRight: 10 
  },
  headerText: { 
    fontSize: 22, 
    fontWeight: "700" 
  },
  lessonBox: { 
    padding: 18, 
    borderRadius: 12, 
    marginBottom: 12, 
    flexDirection: 'row', 
    alignItems: 'center',
    borderWidth: 1,
  },
  lessonText: { 
    fontSize: 17 
  },
  bottomNav: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginTop: 15, 
    marginBottom: 15 
  },
  navBtn: { 
    padding: 12, 
    borderRadius: 8, 
    width: 90, 
    alignItems: 'center', 
    marginBottom: 35,
  },
  navText: { 
    color: '#fff', 
    fontWeight: 'bold' 
  }
});

export default TrainingLessonScreen;