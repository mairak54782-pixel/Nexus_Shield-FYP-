import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  StatusBar,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as Animatable from "react-native-animatable";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useTheme } from "../context/ThemeContext";
import { BASE_URL } from '../config';

const { width } = Dimensions.get("window");

const QuizScreen = ({ route, navigation }) => {
  const { theme, isDark } = useTheme();
  const { lesson } = route.params || {};

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);

  useEffect(() => {
    const getInitialData = async () => {
      try {
        const id = await AsyncStorage.getItem("userId");
        setUserId(id);
        if (lesson) {
          setQuestions(lesson.quizzes || []);
        }
      } catch (err) {
        console.log("Error loading initial data:", err);
      } finally {
        setLoading(false);
      }
    };
    getInitialData();
  }, [lesson]);

  useEffect(() => {
    if (showScore) {
      const timer = setTimeout(() => {
        navigation.pop(2);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showScore]);

  const handleAnswer = (selectedOption) => {
    if (selectedAnswer !== null) return;
    const currentQ = questions[currentIndex];
    const correctAns = currentQ.correct_answer;
    setSelectedAnswer(selectedOption);
    const userIsCorrect = selectedOption === correctAns;
    setIsCorrect(userIsCorrect);
    let currentScore = score;
    if (userIsCorrect) {
      currentScore = score + 1;
      setScore(prev => prev + 1);
    }
    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setSelectedAnswer(null);
        setIsCorrect(null);
      } else {
        setShowScore(true);
        submitScore(currentScore);
      }
    }, 1000);
  };

  const submitScore = async (finalScore) => {
    try {
      const idFromStorage = await AsyncStorage.getItem("userId");
      const nameFromStorage = await AsyncStorage.getItem("userName");
      await axios.post(`${BASE_URL}/api/save-quiz-result`, {
        user_id: idFromStorage,
        user_name: nameFromStorage || "Unknown User",
        level: lesson?.level || 1,
        score: finalScore,
        total: questions.length,
        type: "quiz",
      });
      console.log("Quiz Saved with Name:", nameFromStorage);
    } catch (e) {
      console.log("Backend Save failed:", e);
    }
  };

  if (loading || questions.length === 0) {
    return (
      <LinearGradient colors={theme.gradient} style={styles.container}>
        <StatusBar barStyle={theme.statusBar} />
        <ActivityIndicator size="large" color={theme.accent} />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={theme.gradient} style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar barStyle={theme.statusBar} />

        {showScore ? (
          <View style={styles.modalOverlay}>
            <Animatable.View
              animation="fadeInUp"
              style={[styles.smallCard, { backgroundColor: theme.card, borderColor: theme.accent }]}
            >
              <Ionicons name="ribbon" size={40} color={theme.accent} />
              <Text style={[styles.scoreTitle, { color: theme.placeholder }]}>Quiz Score</Text>
              <Text style={[styles.bigScore, { color: theme.accent }]}>
                {score} / {questions.length}
              </Text>
            </Animatable.View>
          </View>
        ) : (
          <View style={styles.quizWrapper}>
            <View style={styles.header}>
              <TouchableOpacity
                style={[styles.circularBack, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
                onPress={() => navigation.goBack()}
              >
                <Ionicons name="arrow-back" size={24} color={theme.text} />
              </TouchableOpacity>
              <Text style={[styles.headerTitle, { color: theme.text }]}>Quiz</Text>
              <View style={{ width: 42 }} />
            </View>

            <View style={styles.qContainer}>
              <Text style={[styles.progressText, { color: theme.accent }]}>
                Question {currentIndex + 1} of {questions.length}
              </Text>

              <Animatable.View
                animation="fadeInRight"
                key={currentIndex}
                style={[styles.questionBox, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
              >
                <Text style={[styles.questionText, { color: theme.text }]}>
                  {questions[currentIndex].question}
                </Text>
              </Animatable.View>

              <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: 20 }}>
                {questions[currentIndex].options.map((option, i) => {
                  const currentQuestion = questions[currentIndex];
                  const isThisOptionCorrect = option.trim() === currentQuestion.correct_answer.trim();
                  let buttonStyle = [styles.optionBtn, { backgroundColor: theme.inputBg, borderColor: theme.border }];
                  if (selectedAnswer !== null) {
                    if (selectedAnswer === option) {
                      buttonStyle = [
                        styles.optionBtn,
                        isCorrect ? styles.correctBtn : styles.wrongBtn,
                      ];
                    } else if (isThisOptionCorrect) {
                      buttonStyle = [styles.optionBtn, styles.correctBtn];
                    }
                  }
                  return (
                    <TouchableOpacity
                      key={i}
                      style={buttonStyle}
                      onPress={() => handleAnswer(option)}
                      disabled={selectedAnswer !== null}
                    >
                      <Text style={[styles.optionText, { color: theme.text }]}>{option}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </View>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.8)",
  },
  smallCard: {
    width: 220,
    padding: 30,
    borderRadius: 25,
    alignItems: "center",
    borderWidth: 1,
  },
  scoreTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 10,
    letterSpacing: 1,
  },
  bigScore: {
    fontSize: 42,
    fontWeight: "bold",
    marginVertical: 5,
  },
  quizWrapper: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 70,
    paddingBottom: 10,
  },
  circularBack: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  headerTitle: { fontSize: 25, fontWeight: "700" },
  qContainer: { flex: 1, padding: 20 },
  progressText: { textAlign: "center", fontWeight: "bold", marginBottom: 20 },
  questionBox: {
    padding: 25,
    borderRadius: 20,
    borderWidth: 1,
  },
  questionText: { fontSize: 18, textAlign: "center", lineHeight: 26 },
  optionBtn: {
    padding: 18,
    borderRadius: 15,
    marginBottom: 12,
    borderWidth: 1,
  },
  optionText: { fontSize: 16, textAlign: "center" },
  correctBtn: {
    backgroundColor: "rgba(46, 204, 113, 0.3)",
    borderColor: "#2ecc71",
    borderWidth: 2,
  },
  wrongBtn: {
    backgroundColor: "rgba(231, 76, 60, 0.3)",
    borderColor: "#e74c3c",
    borderWidth: 2,
  },
});

export default QuizScreen;