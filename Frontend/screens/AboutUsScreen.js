

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { useTheme } from '../context/ThemeContext';

export default function AboutUsScreen({ navigation }) {
  const { theme, isDark } = useTheme();

  return (
    <LinearGradient colors={theme.gradient} style={styles.container}>
      <SafeAreaView style={{ flex: 1, backgroundColor: 'transparent' }}>
        <StatusBar barStyle={theme.statusBar} backgroundColor="transparent" />

        {/* Header with proper top spacing */}
        <View style={styles.header}>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
            onPress={() => navigation?.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>About</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Hero Section */}
          <Animatable.View animation="fadeInUp" duration={800} style={styles.hero}>
            <View style={[styles.logoCircle, { backgroundColor: `${theme.accent}15`, borderColor: `${theme.accent}40` }]}>
              <Ionicons name="shield-checkmark" size={56} color={theme.accent} />
            </View>
            <Text style={[styles.appName, { color: theme.text }]}>NEXUS SHIELD</Text>
            <Text style={[styles.tagline, { color: theme.placeholder }]}>Your Personal Cyber Safety Assistant</Text>
          </Animatable.View>

          {/* Mission */}
          <Animatable.View animation="fadeInUp" duration={800} delay={100}>
            <Card theme={theme}>
              <View style={styles.cardHeader}>
                <Ionicons name="flag-outline" size={24} color={theme.accent} />
                <Text style={[styles.cardTitle, { color: theme.text }]}>Our Mission</Text>
              </View>
              <Text style={[styles.description, { color: theme.text }]}>
                We help you stay safe online by making cybersecurity easy,
                practical, and personalized – no technical jargon, just simple
                habits that protect you from real-world threats.
              </Text>
            </Card>
          </Animatable.View>

          {/* What Nexus Shield Does */}
          <Animatable.View animation="fadeInUp" duration={800} delay={150}>
            <Card theme={theme}>
              <View style={styles.cardHeader}>
                <Ionicons name="bulb-outline" size={24} color={theme.accent} />
                <Text style={[styles.cardTitle, { color: theme.text }]}>What This App Does</Text>
              </View>
              <Text style={[styles.description, { color: theme.text }]}>
                Nexus Shield teaches you how to recognize risky links, avoid
                phishing attacks, and build secure online habits – all through
                quick lessons, fun quizzes, and smart reminders that adapt to you.
              </Text>
            </Card>
          </Animatable.View>

          {/* Key Features */}
          <Animatable.View animation="fadeInUp" duration={800} delay={200}>
            <Card theme={theme}>
              <View style={styles.cardHeader}>
                <Ionicons name="apps-outline" size={24} color={theme.accent} />
                <Text style={[styles.cardTitle, { color: theme.text }]}>Key Features</Text>
              </View>
              <FeatureItem icon="school-outline" text="Short, bite-sized lessons (flashcards)" theme={theme} />
              <FeatureItem icon="quiz-outline" text="Fun quizzes after each topic" theme={theme} />
              <FeatureItem icon="link-outline" text="Check any link – is it safe or suspicious?" theme={theme} />
              <FeatureItem icon="newspaper-outline" text="Live cybersecurity news & articles" theme={theme} />
              <FeatureItem icon="bar-chart-outline" text="Track your progress & see improvement" theme={theme} />
              <FeatureItem icon="notifications-outline" text="Smart reminders (only what’s relevant to you)" theme={theme} />
              <FeatureItem icon="person-outline" text="Personalized experience based on your knowledge level" theme={theme} />
            </Card>
          </Animatable.View>

          {/* How It Works */}
          <Animatable.View animation="fadeInUp" duration={800} delay={250}>
            <Card theme={theme}>
              <View style={styles.cardHeader}>
                <Ionicons name="sync-outline" size={24} color={theme.accent} />
                <Text style={[styles.cardTitle, { color: theme.text }]}>How It Works</Text>
              </View>
              <Text style={[styles.description, { color: theme.text }]}>
                1️⃣ Take a quick initial survey – tells us your current cyber safety level.
              </Text>
              <Text style={[styles.description, { color: theme.text }]}>
                2️⃣ Based on your answers, we send you helpful security reminder tips.
              </Text>
              <Text style={[styles.description, { color: theme.text }]}>
                3️⃣ You learn via flashcards, test yourself with quizzes, and see your score improve.
              </Text>
              <Text style={[styles.description, { color: theme.text }]}>
                4️⃣ Over time, the app learns what kind of tips you prefer and sends them.
              </Text>
            </Card>
          </Animatable.View>

          {/* Link Safety Check */}
          <Animatable.View animation="fadeInUp" duration={800} delay={300}>
            <Card theme={theme}>
              <View style={styles.cardHeader}>
                <Ionicons name="shield-checkmark-outline" size={24} color={theme.accent} />
                <Text style={[styles.cardTitle, { color: theme.text }]}>Link Safety Check</Text>
              </View>
              <Text style={[styles.description, { color: theme.text }]}>
                Paste any link into the app – we’ll instantly tell you if it’s likely
                safe or a potential phishing site. Always double-check before clicking!
              </Text>
            </Card>
          </Animatable.View>

          {/* Progress & Levels */}
          <Animatable.View animation="fadeInUp" duration={800} delay={350}>
            <Card theme={theme}>
              <View style={styles.cardHeader}>
                <Ionicons name="trophy-outline" size={24} color={theme.accent} />
                <Text style={[styles.cardTitle, { color: theme.text }]}>Your Progress & Level</Text>
              </View>
              <Text style={[styles.description, { color: theme.text }]}>
                You start as Beginner, Intermediate, or Advanced based on the initial survey.
                As you complete lessons and quizzes and read notification reminders, your level and scores improve – you’ll
                see exactly where you’re getting better.
              </Text>
            </Card>
          </Animatable.View>

          {/* Privacy Note */}
          <Animatable.View animation="fadeInUp" duration={800} delay={400}>
            <Card theme={theme}>
              <View style={styles.cardHeader}>
                <Ionicons name="lock-closed-outline" size={24} color={theme.accent} />
                <Text style={[styles.cardTitle, { color: theme.text }]}>Your Privacy Matters</Text>
              </View>
              <Text style={[styles.description, { color: theme.text }]}>
                This app is for educational purposes. We do not sell or misuse your data.
                Link checks are predictions – always stay cautious online.
              </Text>
            </Card>
          </Animatable.View>

          {/* Footer */}
          <Animatable.View animation="fadeInUp" duration={800} delay={450} style={styles.footer}>
            <Text style={[styles.version, { color: theme.text }]}>Version 1.0.0</Text>
            <Text style={[styles.footerText, { color: theme.placeholder }]}>© 2026 Nexus Shield Team</Text>
          </Animatable.View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

// Reusable components with theme support
const Card = ({ children, theme }) => (
  <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
    {children}
  </View>
);

const FeatureItem = ({ icon, text, theme }) => (
  <View style={styles.featureRow}>
    <Ionicons name={icon} size={20} color={theme.accent} style={{ width: 28 }} />
    <Text style={[styles.featureText, { color: theme.placeholder }]}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: Platform.OS === 'ios' ? 10 : (StatusBar.currentHeight || 20) + 8,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  headerTitle: {
    fontSize: 25,
    fontWeight: '600',
    letterSpacing: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  hero: {
    alignItems: 'center',
    marginVertical: 20,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  tagline: {
    fontSize: 14,
    marginTop: 6,
  },
  card: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 18,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  description: {
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 12,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 10,
  },
  featureText: {
    fontSize: 15,
    flex: 1,
    lineHeight: 22,
  },
  footer: {
    alignItems: 'center',
    marginTop: 20,
    paddingVertical: 20,
  },
  version: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  footerText: {
    fontSize: 13,
  },
});