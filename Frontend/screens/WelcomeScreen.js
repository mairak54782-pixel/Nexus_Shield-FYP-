import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Dimensions,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Animatable from "react-native-animatable";

const { width } = Dimensions.get("window");

export default function WelcomeScreen({ navigation }) {
  return (
    <LinearGradient
      colors={["#121026", "#1e1a3a"]} // ✅ Matching Login/Signup background
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor="#121026" />

      {/* Animated Logo */}
      <Animatable.Image
        animation="fadeInDown"
        duration={1200}
        source={require("../assets/welcome.png")}
        style={styles.image}
        resizeMode="contain"
      />

      {/* Text Section */}
      <Animatable.View
        animation="fadeInUp"
        duration={1000}
        delay={300}
        style={styles.textContainer}
      >
        <Text style={styles.title}>Welcome to</Text>
        <Text style={styles.appName}>
          Nexus<Text style={styles.highlight}> Shield</Text>
        </Text>

        <LinearGradient
          colors={["#00d2ff", "#3a7bd5"]} // ✅ Match button gradient
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.separator}
        />

        <Text style={styles.subtitle}>Empowering Your Digital Safety</Text>

        {/* Get Started Button - same as Login/Signup button */}
        <Animatable.View
          animation="pulse"
          iterationCount="infinite"
          duration={3000}
          style={styles.buttonWrapper}
        >
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate("Signup")}
          >
            <LinearGradient
              colors={["#00d2ff", "#3a7bd5"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientButton}
            >
              <Text style={styles.buttonText}>Get Started</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animatable.View>
      </Animatable.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  image: {
    width: 220,
    height: 220,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: "#00d2ff",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
      },
      android: {
        elevation: 15,
      },
    }),
  },
  textContainer: {
    alignItems: "center",
    marginTop: -10,
  },
  title: {
    fontSize: 20,
    fontWeight: "500",
    color: "#a9a9ac",
    letterSpacing: 1.5,
    marginBottom: 5,
    textTransform: "uppercase",
  },
  appName: {
    fontSize: 42,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  highlight: {
    fontWeight: "800",
    color: "#00d2ff", // ✅ Accent color from Login/Signup
    textShadowColor: "#004e57",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  separator: {
    width: 80,
    height: 3,
    borderRadius: 3,
    marginBottom: 24,
  },
  subtitle: {
    fontSize: 16,
    color: "#CBD5E1",
    marginBottom: 48,
    textAlign: "center",
    lineHeight: 22,
    letterSpacing: 0.5,
  },
  buttonWrapper: {
    shadowColor: "#00d2ff",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  gradientButton: {
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 40,
    width: width * 0.6,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    letterSpacing: 1,
  },
});