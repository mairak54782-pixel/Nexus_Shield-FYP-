import React, { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Linking,
  ActivityIndicator, SafeAreaView, Image, StatusBar
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../context/ThemeContext";
import { BASE_URL } from '../config';

// Helper to get YouTube thumbnail from video URL
const getYouTubeThumbnail = (url) => {
  if (!url) return null;
  const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/;
  const match = url.match(regex);
  if (match && match[1]) {
    return `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
  }
  return null;
};

export default function NewsScreen({ navigation }) {
  const { theme, isDark } = useTheme();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNews = async () => {
    try {
      const response = await fetch("${BASE_URL}/api/news");
      const data = await response.json();
      setNews(data.news || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const openContent = (link, videoUrl) => {
    if (videoUrl) Linking.openURL(videoUrl);
    else if (link) Linking.openURL(link);
  };

  const renderItem = ({ item }) => {
    const videoThumb = getYouTubeThumbnail(item.videoUrl);
    const displayImage = videoThumb || item.imageUrl || null;
    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
        onPress={() => openContent(item.link, item.videoUrl)}
        activeOpacity={0.8}
      >
        {displayImage && (
          <View style={styles.imageContainer}>
            <Image source={{ uri: displayImage }} style={styles.newsImage} resizeMode="cover" />
            {videoThumb && (
              <View style={styles.playOverlay}>
                <Ionicons name="play-circle" size={50} color="white" />
              </View>
            )}
          </View>
        )}
        <View style={styles.textBox}>
          <Text style={[styles.title, { color: theme.text }]} numberOfLines={2}>{item.title}</Text>
          <Text style={[styles.desc, { color: theme.placeholder }]} numberOfLines={3}>
            {item.description?.slice(0, 150)}...
          </Text>
          <Text style={[styles.date, { color: theme.placeholder }]}>
            🗓 {item.pubDate ? new Date(item.pubDate).toDateString() : "Recent"}
          </Text>
          <Text style={[styles.readMore, { color: theme.accent }]}>
            {item.videoUrl ? "Watch Video →" : "Read Full News →"}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <LinearGradient colors={theme.gradient} style={styles.container}>
      <StatusBar barStyle={theme.statusBar} />
      <SafeAreaView style={{ flex: 1 }}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={26} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.header, { color: theme.text }]}>Cyber News</Text>
        {loading ? (
          <ActivityIndicator size="large" color={theme.accent} style={{ marginTop: 40 }} />
        ) : news.length === 0 ? (
          <Text style={[styles.noData, { color: theme.placeholder }]}>⚠️ No news found. Pull to refresh later.</Text>
        ) : (
          <FlatList
            data={news}
            keyExtractor={(_, i) => i.toString()}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
          />
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  backButton: {
    position: "absolute",
    top: 50,
    left: 15,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  header: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 15,
    marginTop: 60,
  },
  noData: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
  },
  card: {
    borderRadius: 15,
    overflow: "hidden",
    marginBottom: 15,
    marginHorizontal: 16,
    borderWidth: 1,
  },
  imageContainer: { position: "relative" },
  newsImage: { width: "100%", height: 200 },
  playOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  textBox: { padding: 12 },
  title: { fontSize: 16, fontWeight: "600" },
  desc: { marginTop: 5, fontSize: 14 },
  date: { marginTop: 6, fontSize: 12 },
  readMore: { marginTop: 8, fontSize: 14, fontWeight: "bold" },
});