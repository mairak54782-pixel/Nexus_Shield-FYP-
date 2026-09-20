import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import * as Animatable from "react-native-animatable";
import { MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRoute, useFocusEffect } from "@react-navigation/native";
import { useTheme } from "../context/ThemeContext";

const { width } = Dimensions.get("window");

const HomeScreen = ({ navigation }) => {
  const { theme, isDark } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef(null);
  const route = useRoute();
  const [userName, setUserName] = useState("Guest");

  // Load user name when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      const loadProfile = async () => {
        try {
          const profileStr = await AsyncStorage.getItem('userProfile');
          if (profileStr) {
            const profile = JSON.parse(profileStr);
            setUserName(profile.name || "Guest");
          } else {
            const savedName = await AsyncStorage.getItem('userName');
            if (savedName) setUserName(savedName);
          }
        } catch (e) {
          console.log("Error loading profile", e);
        }
      };
      loadProfile();
    }, [])
  );

  useEffect(() => {
    const fetchUser = async () => {
      const navName = route.params?.user?.name || route.params?.name;
      if (navName) {
        setUserName(navName);
        await AsyncStorage.setItem('userName', navName);
      } else {
        const savedName = await AsyncStorage.getItem('userName');
        if (savedName) setUserName(savedName);
      }
    };
    fetchUser();
  }, [route.params]);

  const images = [
    require("../assets/banner1.png"),
    require("../assets/banner2.png"),
    require("../assets/banner3.png"),
    require("../assets/banner7.jpg"),
    require("../assets/banner4.png"),
    require("../assets/banner5.png"),
    require("../assets/banner9.png"),
    require("../assets/banner8.png"),
    require("../assets/banner6.png"),
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      const nextIndex = (currentIndex + 1) % images.length;
      setCurrentIndex(nextIndex);
      scrollRef.current?.scrollTo({ x: nextIndex * width, animated: true });
    }, 2500);
    return () => clearInterval(timer);
  }, [currentIndex]);

  return (
    <LinearGradient colors={theme.gradient} style={styles.container}>
      <StatusBar barStyle={theme.statusBar} />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Top Bar - only greeting now */}
        <View style={styles.topBar}>
          <Text style={[styles.greeting, { color: theme.text }]}>Hi, {userName}</Text>
        </View>

        {/* Image Slider */}
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          style={styles.slider}
        >
          {images.map((img, index) => (
            <Image key={index} source={img} style={styles.slideImage} resizeMode="cover" />
          ))}
        </ScrollView>

        {/* Boxes */}
        <Animatable.View animation="fadeInUp" duration={1000} style={styles.boxContainer}>
          <TouchableOpacity
            style={[styles.box, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
            onPress={() => navigation.navigate("TrainingLesson")}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="shield-check" size={32} color={theme.accent} />
            <Text style={[styles.boxText, { color: theme.text }]}>Training</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.box, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
            onPress={() => navigation.navigate("ProgressReport")}
            activeOpacity={0.8}
          >
            <FontAwesome5 name="chart-line" size={32} color={theme.accent} />
            <Text style={[styles.boxText, { color: theme.text }]}>Progress Report</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.box, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
            onPress={() => navigation.navigate("Incidents")}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="alert-octagram-outline" size={32} color={theme.accent} />
            <Text style={[styles.boxText, { color: theme.text }]}>Previous Attack</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.box, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
            onPress={() => navigation.navigate("LinkCheckerScreen")}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="link-lock" size={32} color={theme.accent} />
            <Text style={[styles.boxText, { color: theme.text }]}>Link Scanner</Text>
          </TouchableOpacity>
        </Animatable.View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    marginTop: 60,
    marginHorizontal: 25,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  greeting: { fontSize: 18, fontWeight: "600" },
  slider: { width: "100%", height: 200, marginTop: 20 },
  slideImage: { width: width, height: 200, borderRadius: 15 },
  boxContainer: {
    marginTop: 30,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    paddingBottom: 40,
  },
  box: {
    width: width * 0.4,
    height: 130,
    borderRadius: 20,
    marginVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    shadowColor: "#00e5ff",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  boxText: { fontSize: 15, fontWeight: "600", marginTop: 8 },
});

export default HomeScreen;