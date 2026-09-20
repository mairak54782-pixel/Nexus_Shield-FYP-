

// screens/PrivacyPolicy.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const PrivacyPolicy = ({ navigation }) => {
  const { theme } = useTheme();

  return (
    <LinearGradient colors={theme.gradient} style={styles.container}>
      <StatusBar barStyle={theme.statusBar} />
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={26} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerText, { color: theme.text }]}>Privacy Policy</Text>
          <View style={{ width: 26 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={[styles.lastUpdated, { color: theme.placeholder }]}>Last updated: May 2025</Text>

          <Text style={[styles.sectionTitle, { color: theme.accent }]}>1. Information We Collect</Text>
          <Text style={[styles.paragraph, { color: theme.text }]}>
            We collect personal information you provide directly to us, such as your name, email address, and role. We take a survey to check your cyber hygiene.
          </Text>

          <Text style={[styles.sectionTitle, { color: theme.accent }]}>2. How We Use Your Information</Text>
          <Text style={[styles.paragraph, { color: theme.text }]}>
            • To create and manage your account{'\n'}
            • To personalize cybersecurity training and tips{'\n'}
            • To send important security notifications (with your consent){'\n'}
            • To improve app features and user experience
          </Text>

          <Text style={[styles.sectionTitle, { color: theme.accent }]}>3. Data Security</Text>
          <Text style={[styles.paragraph, { color: theme.text }]}>
            We implement industry‑standard security measures to protect your data. However, no method of transmission over the internet is 100% secure.
          </Text>

          <Text style={[styles.sectionTitle, { color: theme.accent }]}>4. Sharing of Information</Text>
          <Text style={[styles.paragraph, { color: theme.text }]}>
            We do not sell or rent your personal data. We may share anonymised, aggregated data for research or analytics.
          </Text>

          <Text style={[styles.sectionTitle, { color: theme.accent }]}>5. Your Rights</Text>
          <Text style={[styles.paragraph, { color: theme.text }]}>
            You can access, update, or delete your personal information at any time from the app. For any requests, contact us at support@nexusshield.com.
          </Text>

          <Text style={[styles.sectionTitle, { color: theme.accent }]}>6. Changes to This Policy</Text>
          <Text style={[styles.paragraph, { color: theme.text }]}>
            We may update this policy occasionally. We will notify you of any material changes via the app or email.
          </Text>

          <Text style={[styles.footerText, { color: theme.placeholder }]}>
            If you have any questions, please contact us at support@nexusshield.com
          </Text>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: 50,
    marginBottom: 10,
  },
  headerText: { fontSize: 22, fontWeight: "bold" },
  content: {
    paddingHorizontal: 22,
    paddingBottom: 40,
  },
  lastUpdated: {
    fontSize: 13,
    marginBottom: 20,
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 12,
  },
  footerText: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 30,
    marginBottom: 20,
  },
});

export default PrivacyPolicy;