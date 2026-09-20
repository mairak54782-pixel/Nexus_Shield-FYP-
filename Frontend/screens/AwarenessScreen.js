// screens/AwarenessIntroScreen.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { Ionicons } from '@expo/vector-icons';

const AwarenessScreen = ({ navigation, route }) => {
  const { userId } = route.params || {};

  return (
    <LinearGradient colors={["#121026", "#1e1a3a"]} style={styles.container}>
      <StatusBar barStyle="light-content" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Single box – why survey */}
        <Animatable.View animation="fadeInUp" duration={800} style={styles.card}>
          <Ionicons name="clipboard-outline" size={40} color="#00d2ff" style={styles.icon} />
          <Text style={styles.cardText}>
            We are conducting a short survey to check your current cyber hygiene and awareness level.
          </Text>
          <Text style={styles.cardText}>
            Your answers will help us guide you — so you can improve your cyber practices and stay safer online.
          </Text>
          <Text style={styles.note}>
            ⚡Takes only 2–3 minutes. read all questions carefully and answer all properly.
          </Text>
        </Animatable.View>

        {/* Start button */}
        <Animatable.View animation="pulse" iterationCount="infinite" duration={3000} style={styles.buttonWrapper}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.replace("Survey", { userId })}
          >
            <LinearGradient
              colors={["#00d2ff", "#3a7bd5"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientButton}
            >
              <Text style={styles.buttonText}>Start Survey</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animatable.View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#00d2ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#00d2ff',
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  logoText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e1a3a',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#1e1a3a',
    borderRadius: 28,
    padding: 28,
    borderWidth: 1,
    borderColor: 'rgba(0, 210, 255, 0.2)',
    shadowColor: '#00d2ff',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    marginBottom: 30,
    alignItems: 'center',
  },
  icon: {
    marginBottom: 16,
  },
  cardText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#CBD5E1',
    textAlign: 'center',
    marginBottom: 12,
  },
  note: {
    fontSize: 14,
    color: '#00d2ff',
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '500',
  },
  buttonWrapper: {
    shadowColor: "#00d2ff",
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  gradientButton: {
    paddingVertical: 16,
    alignItems: "center",
    borderRadius: 40,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 1,
  },
});

export default AwarenessScreen;