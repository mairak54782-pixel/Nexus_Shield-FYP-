import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  Platform,
  ActivityIndicator,
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import { BASE_URL } from '../config';

const { width } = Dimensions.get('window');

const ProgressReportScreen = ({ navigation }) => {
  const { theme, isDark } = useTheme();
  const [stats, setStats] = useState({
    lessons: 0,
    quizzes: 0,
    quizScoreAvg: 0,
    level: 'Beginner',
  });
  const [loading, setLoading] = useState(true);
  const API_URL = '${BASE_URL}';

  const getCurrentDate = () => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date());
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const storedId = await AsyncStorage.getItem('userId');
      if (storedId) {
        const response = await axios.get(`${API_URL}/api/progress-stats/${storedId}`);
        setStats({
          lessons: response.data.lessons,
          quizzes: response.data.quizzes,
          quizScoreAvg: response.data.quizScoreAvg * 100, // convert to percentage
          level: response.data.level,
        });
      }
    } catch (error) {
      console.log('Stats fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <LinearGradient colors={theme.gradient} style={styles.container}>
        <StatusBar barStyle={theme.statusBar} />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={theme.accent} />
        </View>
      </LinearGradient>
    );
  }

  const percentage = Math.round(stats.quizScoreAvg);
  const size = width * 0.5;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <LinearGradient colors={theme.gradient} style={styles.container}>
      <StatusBar barStyle={theme.statusBar} />
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={[styles.backButtonHome, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
            onPress={() => navigation?.goBack()}
          >
            <Ionicons name="arrow-back" size={22} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerText, { color: theme.text }]}>Progress Report</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Date */}
          <Text style={[styles.dateText, { color: theme.placeholder }]}>{getCurrentDate()}</Text>

          {/* Status Badge */}
          <View style={styles.statusSection}>
            <Text style={[styles.statusLabel, { color: theme.text }]}>Current Status:</Text>
            <View style={styles.levelBadgeWrapper}>
              <LinearGradient colors={[theme.accent, theme.accent]} style={styles.levelBadgeGradient}>
                <Text style={styles.levelBadgeText}>{stats.level.toUpperCase()}</Text>
              </LinearGradient>
            </View>
          </View>

          {/* Single Donut Chart for Average Quiz Score */}
          <View style={styles.chartArea}>
            <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
              {/* Background circle */}
              <Circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={isDark ? 'rgba(255,255,255,0.15)' : '#E2E8F0'}
                strokeWidth={strokeWidth}
                fill="none"
              />
              {/* Progress circle */}
              <Circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={theme.accent}
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="none"
                transform={`rotate(-90, ${size / 2}, ${size / 2})`}
              />
            </Svg>
            <View style={styles.chartOverlay}>
              <Text style={[styles.percentNumber, { color: theme.text }]}>{percentage}%</Text>
              <Text style={[styles.percentLabel, { color: theme.placeholder }]}>Avg Quiz Score</Text>
            </View>
          </View>

          {/* Stats Tiles (Lessons & Quizzes) */}
          <View style={styles.tilesRow}>
            <View style={styles.tile}>
              <LinearGradient
                colors={isDark ? ['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.02)'] : ['rgba(0,0,0,0.04)', 'rgba(0,0,0,0.01)']}
                style={[styles.tileInner, { borderColor: theme.cardBorder }]}
              >
                <View style={[styles.iconWrapper, { backgroundColor: `${theme.accent}20` }]}>
                  <MaterialCommunityIcons name="book-open-variant" size={28} color={theme.accent} />
                </View>
                <Text style={[styles.tileVal, { color: theme.text }]}>{stats.lessons}</Text>
                <Text style={[styles.tileLab, { color: theme.placeholder }]}>Lessons Done</Text>
              </LinearGradient>
            </View>

            <View style={styles.tile}>
              <LinearGradient
                colors={isDark ? ['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.02)'] : ['rgba(0,0,0,0.04)', 'rgba(0,0,0,0.01)']}
                style={[styles.tileInner, { borderColor: theme.cardBorder }]}
              >
                <View style={[styles.iconWrapper, { backgroundColor: `${theme.accent}20` }]}>
                  <MaterialCommunityIcons name="trophy-outline" size={28} color={theme.accent} />
                </View>
                <Text style={[styles.tileVal, { color: theme.text }]}>{stats.quizzes}</Text>
                <Text style={[styles.tileLab, { color: theme.placeholder }]}>Quizzes Attempted</Text>
              </LinearGradient>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 10,
    marginTop: Platform.OS === 'android' ? 40 : 10,
  },
  backButtonHome: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginRight: 15,
    borderWidth: 1,
  },
  headerText: { fontSize: 22, fontWeight: '700', letterSpacing: 0.3 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  dateText: { fontSize: 13, marginBottom: 15 },
  statusSection: { flexDirection: 'row', alignItems: 'center', marginTop: 10, marginBottom: 20 },
  statusLabel: { fontSize: 16, fontWeight: '500' },
  levelBadgeWrapper: { marginLeft: 12, borderRadius: 10, overflow: 'hidden' },
  levelBadgeGradient: { paddingHorizontal: 16, paddingVertical: 6 },
  levelBadgeText: { color: 'white', fontSize: 11, fontWeight: 'bold', letterSpacing: 1 },
  chartArea: { alignItems: 'center', justifyContent: 'center', marginVertical: 20 },
  chartOverlay: { position: 'absolute', alignItems: 'center' },
  percentNumber: { fontSize: 42, fontWeight: 'bold' },
  percentLabel: { fontSize: 13 },
  tilesRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  tile: { width: '48%', borderRadius: 18, overflow: 'hidden' },
  tileInner: { padding: 20, alignItems: 'center', borderWidth: 1 },
  iconWrapper: { padding: 10, borderRadius: 12, marginBottom: 8 },
  tileVal: { fontSize: 24, fontWeight: 'bold' },
  tileLab: { fontSize: 12 },
});

export default ProgressReportScreen;