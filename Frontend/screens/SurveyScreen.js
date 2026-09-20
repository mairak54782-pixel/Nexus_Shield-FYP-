import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, SafeAreaView, StatusBar, Alert, Platform
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { BASE_URL } from '../config';

// EXACT CATEGORY_MAP
const CATEGORY_MAP = {
  "T1": "Password Security", "T2": "Device Security", "T3": "Physical Security",
  "T4": "Network Security", "T5": "Password Security", "T6": "Password Security",
  "T7": "Software Updates", "T8": "Malware Protection", "S1": "App Security",
  "S2": "Phishing", "S3": "Web Security", "S4": "Phishing",
  "S5": "Phishing", "S6": "Device Security"
};

const OPTIONS = [
  { label: 'Never', value: 1 },
  { label: 'Rarely', value: 2 },
  { label: 'Sometimes', value: 3 },
  { label: 'Often', value: 4 },
  { label: 'Always', value: 5 },
];

const QUESTIONS = [
  { id: 'T1', text: 'I use complex passwords with a mix of letters, numbers, and symbols.' },
  { id: 'T2', text: 'I lock my devices with a PIN, password, or biometrics every time.' },
  { id: 'T3', text: 'I protect my screen from shoulder surfing and never leave devices unattended.' },
  { id: 'T4', text: 'I avoid using public Wi-Fi for banking or sensitive logins.' },
  { id: 'T5', text: 'I avoid using the same password for multiple online accounts.' },
  { id: 'T6', text: 'I use a password manager to store and generate strong passwords.' },
  { id: 'T7', text: 'I install software and OS updates as soon as they are available.' },
  { id: 'T8', text: 'I use reputable antivirus software and perform regular scans.' },
  { id: 'S1', text: 'I only download apps from official stores like Play Store or App Store.' },
  { id: 'S2', text: 'I check the sender email address before clicking on any links.' },
  { id: 'S3', text: 'I look for HTTPS and the padlock icon before entering info on websites.' },
  { id: 'S4', text: 'I am cautious about emails that create a sense of urgency or fear.' },
  { id: 'S5', text: 'I never share my OTP or login credentials over calls or messages.' },
  { id: 'S6', text: 'I regularly review and revoke app permissions that are not needed.' }
];

export default function SurveyScreen({ navigation, route }) {
  const { userId } = route.params;
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
      ? "http://localhost:8000"
      : "${BASE_URL}"; 
  
  const answeredCount = Object.keys(answers).length;

  const selectOption = (questionId, value) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const submitSurvey = async () => {
    if (answeredCount < 14) {
      Alert.alert('Incomplete', 'Please answer all 14 questions.');
      return;
    }

    const answersArray = QUESTIONS.map(q => ({
        questionId: q.id,
        score: answers[q.id] || 0
    }));

    setLoading(true);
    try {
      const res = await axios.post(`${BASE_URL}/survey`, { 
        userId, 
        answers: answersArray 
      });

      await AsyncStorage.setItem('userLevel', String(res.data.level));
      await AsyncStorage.setItem('surveyDone', 'true');
      
      navigation.replace('MainTabs');
    } catch (e) {
      console.log("DEBUG ERROR:", e.response?.data || e.message);
      Alert.alert('Error', 'Could not save survey.');
    } finally {
      setLoading(false);
    }
  };

  // ✅ New theme – exactly matching SignupScreen
  const GRADIENT_BG = ["#121026", "#1e1a3a"];
  const BUTTON_GRADIENT = ["#00d2ff", "#3a7bd5"];
  const ACCENT_COLOR = "#00d2ff";

  return (
    <LinearGradient colors={GRADIENT_BG} style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: '#fff' }]}>CYBER ASSESSMENT</Text>
          <View style={[styles.counterBadge, { borderColor: ACCENT_COLOR }]}>
            <Text style={[styles.counterText, { color: ACCENT_COLOR }]}>{answeredCount} / 14</Text>
          </View>
        </View>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          {QUESTIONS.map((q, i) => (
            <View key={q.id} style={styles.questionCard}>
              <Text style={[styles.categoryText, { color: ACCENT_COLOR }]}>
                QUESTION {i + 1} • {CATEGORY_MAP[q.id]}
              </Text>
              <Text style={styles.questionText}>{q.text}</Text>
              <View style={styles.optionsList}>
                {OPTIONS.map((opt) => {
                  const selected = answers[q.id] === opt.value;
                  return (
                    <TouchableOpacity
                      key={opt.value}
                      style={[styles.optionRow, selected && styles.optionRowSelected]}
                      onPress={() => selectOption(q.id, opt.value)}
                    >
                      <View style={[styles.radioCircle, selected && styles.radioCircleSelected]}>
                        {selected && <View style={styles.radioDot} />}
                      </View>
                      <Text style={[styles.optionLabel, selected && styles.optionLabelSelected]}>
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ))}
        </ScrollView>
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.submitBtnWrapper}
            onPress={submitSurvey}
            disabled={answeredCount < 14 || loading}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={BUTTON_GRADIENT}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.submitBtnGradient, (answeredCount < 14 || loading) && styles.submitBtnDisabled]}
            >
              <Text style={styles.submitBtnText}>
                {loading ? 'ANALYZING...' : 'SUBMIT ASSESSMENT'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 20 : 50,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 1,
  },
  counterBadge: {
    backgroundColor: 'rgba(0, 210, 255, 0.15)',   // ACCENT_COLOR with transparency
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  counterText: {
    fontSize: 13,
    fontWeight: '600',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  questionCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  categoryText: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 10,
    letterSpacing: 1.5,
  },
  questionText: {
    fontSize: 16,
    color: '#fff',
    lineHeight: 24,
    marginBottom: 20,
    fontWeight: '500',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  optionRowSelected: {
    borderColor: 'rgba(0, 210, 255, 0.5)',   // ACCENT_COLOR
    backgroundColor: 'rgba(0,210,255,0.1)',
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  radioCircleSelected: {
    borderColor: '#00d2ff',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#00d2ff',
  },
  optionLabel: {
    fontSize: 15,
    color: '#ccc',
    flex: 1,
    flexWrap: 'wrap',
    lineHeight: 20,
  },
  optionLabelSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
  footer: {
    padding: 20,
    paddingBottom: 35,
  },
  submitBtnWrapper: {
    borderRadius: 40,
    overflow: 'hidden',
    shadowColor: '#00d2ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: 10,
  },
  submitBtnGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 1.5,
  },
});