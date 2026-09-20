import React, { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Image,
  Linking, ActivityIndicator, SafeAreaView, StatusBar
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { BASE_URL } from '../config';

export default function IncidentScreen({ navigation }) {
  const { theme, isDark } = useTheme();
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [networkError, setNetworkError] = useState(false);

  const fetchCyberIncidents = async () => {
    try {
      const response = await fetch("${BASE_URL}/api/news");
      const data = await response.json();
      const newsItems = data.news || [];
      if (newsItems.length === 0) setNetworkError(true);
      else {
        const mapped = newsItems.slice(0, 6).map(item => ({
          title: item.title,
          link: item.link,
          description: item.description.replace(/<[^>]+>/g, "").slice(0, 150),
          imageUrl: item.imageUrl || null,
        }));
        setIncidents(mapped);
        setNetworkError(false);
      }
    } catch (err) {
      console.error(err);
      setNetworkError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCyberIncidents();
  }, []);

  return (
    <LinearGradient colors={theme.gradient} style={styles.container}>
      <StatusBar barStyle={theme.statusBar} />
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={[styles.backButton, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={22} color={theme.text} />
            </TouchableOpacity>
            <Text style={[styles.headerText, { color: theme.text }]}>Previous Attacks</Text>
          </View>

          {/* Category Boxes */}
          <View style={styles.categoryContainer}>
            <TouchableOpacity
              style={[styles.categoryBox, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
              onPress={() => navigation.navigate("Article")}
            >
              <MaterialCommunityIcons name="file-document-outline" size={36} color={theme.accent} />
              <Text style={[styles.categoryText, { color: theme.text }]}>Articles</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.categoryBox, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
              onPress={() => navigation.navigate("Blog")}
            >
              <FontAwesome5 name="blog" size={32} color={theme.accent} />
              <Text style={[styles.categoryText, { color: theme.text }]}>Blogs</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.categoryBox, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
              onPress={() => navigation.navigate("News")}
            >
              <Ionicons name="newspaper-outline" size={34} color={theme.accent} />
              <Text style={[styles.categoryText, { color: theme.text }]}>News</Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.infoText, { color: theme.placeholder }]}>
            Real cyber incidents & attacks – learn how to protect yourself.
          </Text>

          <Text style={[styles.sectionTitle, { color: theme.text }]}>Recently Updated</Text>

          {loading ? (
            <ActivityIndicator size="large" color={theme.accent} style={{ marginTop: 30 }} />
          ) : networkError || incidents.length === 0 ? (
            <View style={styles.errorContainer}>
              <Text style={[styles.errorText, { color: theme.placeholder }]}>⚠️ No incidents found. Check your internet.</Text>
              <TouchableOpacity onPress={fetchCyberIncidents} style={[styles.retryBtn, { backgroundColor: theme.accent }]}>
                <Text style={{ color: "#fff" }}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            incidents.map((item, idx) => (
              <TouchableOpacity
                key={idx}
                style={[styles.articleCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
                onPress={() => Linking.openURL(item.link)}
              >
                <Image
                  source={item.imageUrl ? { uri: item.imageUrl } : require("../assets/news.png")}
                  style={styles.articleImage}
                  resizeMode="cover"
                />
                <View style={styles.textContainer}>
                  <Text style={[styles.articleTitle, { color: theme.text }]} numberOfLines={2}>{item.title}</Text>
                  <Text style={[styles.articleDescription, { color: theme.placeholder }]} numberOfLines={2}>{item.description}</Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 50, paddingBottom: 30 },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  backButton: { width: 40, height: 40, justifyContent: "center", alignItems: "center", borderRadius: 10, marginRight: 10, borderWidth: 1 },
  headerText: { fontSize: 22, fontWeight: "700" },
  categoryContainer: { flexDirection: "row", justifyContent: "space-between", marginVertical: 20 },
  categoryBox: { width: "30%", borderRadius: 16, alignItems: "center", justifyContent: "center", paddingVertical: 25, borderWidth: 1 },
  categoryText: { marginTop: 8, fontSize: 15, fontWeight: "600", textAlign: "center" },
  infoText: { textAlign: "center", marginTop: 10, marginBottom: 25, fontSize: 14 },
  sectionTitle: { fontSize: 18, fontWeight: "700", marginBottom: 12 },
  articleCard: { borderRadius: 14, marginBottom: 15, overflow: "hidden", borderWidth: 1 },
  articleImage: { width: "100%", height: 200 },
  textContainer: { padding: 12 },
  articleTitle: { fontSize: 16, fontWeight: "700", marginBottom: 5 },
  articleDescription: { fontSize: 13 },
  errorContainer: { alignItems: "center", marginTop: 40 },
  errorText: { textAlign: "center", fontSize: 16, marginBottom: 15 },
  retryBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
});