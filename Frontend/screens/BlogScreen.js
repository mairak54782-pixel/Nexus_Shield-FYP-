import React, { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Linking, ActivityIndicator, SafeAreaView, StatusBar
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../context/ThemeContext";
import { BASE_URL } from '../config';

export default function BlogScreen({ navigation }) {
  const { theme, isDark } = useTheme();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBlogs = async () => {
    try {
      const response = await fetch("${BASE_URL}/api/blogs");
      const data = await response.json();
      setBlogs(data.blogs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

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

        <Text style={[styles.header, { color: theme.text }]}>Cybersecurity Blogs</Text>

        {loading ? (
          <ActivityIndicator size="large" color={theme.accent} style={{ marginTop: 40 }} />
        ) : blogs.length === 0 ? (
          <Text style={[styles.noData, { color: theme.placeholder }]}>⚠️ No blogs found. Try again later.</Text>
        ) : (
          <FlatList
            data={blogs}
            keyExtractor={(_, i) => i.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
                onPress={() => Linking.openURL(item.link)}
              >
                <Text style={[styles.title, { color: theme.text }]}>{item.title}</Text>
                <Text style={[styles.desc, { color: theme.placeholder }]}>
                  {item.description?.replace(/<[^>]+>/g, "").slice(0, 150)}...
                </Text>
                <Text style={[styles.readMore, { color: theme.accent }]}>Read Blog →</Text>
              </TouchableOpacity>
            )}
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
    padding: 15,
    marginBottom: 15,
    marginHorizontal: 16,
    borderWidth: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: "600",
  },
  desc: {
    marginTop: 6,
    fontSize: 14,
  },
  readMore: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: "bold",
  },
});