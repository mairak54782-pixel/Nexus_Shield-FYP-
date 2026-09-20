import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Animatable from "react-native-animatable";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useTheme } from "../context/ThemeContext";
import { BASE_URL } from '../config';

const { width, height } = Dimensions.get("window");

const FlashCardScreen = ({ route, navigation }) => {
  const { theme, isDark } = useTheme();
  const { lesson, topic, level } = route.params;
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const getStoredId = async () => {
      const id = await AsyncStorage.getItem("userId");
      setUserId(id);
    };
    getStoredId();
  }, []);

  const handleNext = async () => {
    setFlipped(false);
    const totalCards = lesson?.flashcards?.length || 0;

    if (index < totalCards - 1) {
      setIndex(index + 1);
    } else {
      try {
        const idFromStorage = await AsyncStorage.getItem("userId");
        const nameFromStorage = await AsyncStorage.getItem("userName");
        await axios.post(`${BASE_URL}/api/save-quiz-result`, {
          user_id: idFromStorage,
          user_name: nameFromStorage || "Unknown User",
          level: lesson?.level || 1,
          type: "lesson",
        });
        console.log("Lesson Progress Saved!");
      } catch (err) {
        console.log("Error saving lesson:", err);
      }
      navigation.navigate("Quiz", { lesson, topic, level });
    }
  };

  if (!lesson || !lesson.flashcards || lesson.flashcards.length === 0) {
    return (
      <LinearGradient colors={theme.gradient} style={styles.container}>
        <StatusBar barStyle={theme.statusBar} />
        <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <TouchableOpacity style={[styles.backButton, { backgroundColor: theme.card }]} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={{ color: theme.text, fontSize: 18, textAlign: "center", padding: 20 }}>
            No flashcards found for "{topic}".
          </Text>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  const totalCards = lesson.flashcards.length;

  return (
    <LinearGradient colors={theme.gradient} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle={theme.statusBar} />

        {/* Header - only back button */}
        <View style={styles.header}>
          <TouchableOpacity style={[styles.backButton, { backgroundColor: theme.card, borderColor: theme.cardBorder }]} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
          <View style={{ flex: 1 }} />
        </View>

        {/* Topic Title */}
        <Text style={[styles.title, { color: theme.text }]}>{topic}</Text>

        {/* Progress above the card (centered) */}
        <View style={[styles.progressContainer, { backgroundColor: theme.inputBg }]}>
          <Text style={[styles.progressText, { color: theme.accent }]}>{index + 1} / {totalCards}</Text>
        </View>

        {/* Flashcard */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => setFlipped(!flipped)}
          style={styles.cardWrapper}
        >
          <Animatable.View
            animation="flipInY"
            duration={600}
            style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
            key={index + (flipped ? "-back" : "-front")}
          >
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.cardContent}
            >
              <Text style={[styles.cardText, { color: theme.text }]}>
                {flipped
                  ? lesson.flashcards[index].answer
                  : lesson.flashcards[index].question}
              </Text>
            </ScrollView>
            <View style={[styles.tapHint, { borderTopColor: theme.cardBorder }]}>
              <Ionicons name="refresh-circle-outline" size={16} color={theme.accent} />
              <Text style={[styles.hintText, { color: isDark ? "#aaa" : "#666" }]}>
                {flipped ? "Tap for Question" : "Tap for Answer"}
              </Text>
            </View>
          </Animatable.View>
        </TouchableOpacity>

        {/* Next Button */}
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <LinearGradient colors={[theme.accent, theme.accent + "CC"]} style={styles.nextGradient}>
            <Text style={styles.nextText}>
              {index === totalCards - 1 ? "Start Quiz" : "Next Card"}
            </Text>
            <Ionicons name="chevron-forward" size={20} color="#fff" style={{ marginLeft: 10 }} />
          </LinearGradient>
        </TouchableOpacity>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, alignItems: "center" },
  header: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 50,
    marginBottom: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 15,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  progressContainer: {
    marginBottom: 15,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: "center",
  },
  progressText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  cardWrapper: {
    width: width * 0.85,
    minHeight: height * 0.45,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: "100%",
    minHeight: height * 0.45,
    borderRadius: 28,
    borderWidth: 1,
    overflow: "hidden",
    justifyContent: "space-between",
  },
  cardContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingTop: 30,
    paddingBottom: 20,
  },
  cardText: {
    fontSize: 18,
    textAlign: "center",
    lineHeight: 28,
    fontWeight: "500",
  },
  tapHint: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderTopWidth: 0.5,
    marginHorizontal: 20,
    marginBottom: 8,
  },
  hintText: {
    fontSize: 13,
    fontWeight: "500",
    letterSpacing: 0.5,
    marginLeft: 4,
  },
  nextButton: {
    marginTop: "auto",
    marginBottom: 40,
  },
  nextGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 35,
    borderRadius: 40,
    elevation: 5,
  },
  nextText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
});

export default FlashCardScreen;