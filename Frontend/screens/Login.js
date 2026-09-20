import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  StatusBar,
} from "react-native";
import * as Animatable from "react-native-animatable";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from '../config';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [backendError, setBackendError] = useState("");
      ? "http://localhost:8000"
      : "${BASE_URL}";

  const validateEmail = (text) => {
    setEmail(text);
    if (!text) {
      setEmailError("Email cannot be empty");
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(text)) {
        setEmailError("Email is not valid");
      } else {
        setEmailError("");
      }
    }
  };

  const handleLogin = async () => {
    setBackendError("");
    setPasswordError("");

    if (!email || emailError) return;
    if (!password) {
      setPasswordError("Password cannot be empty");
      return;
    }

    try {
      let token = "";
      try {
        const pushTokenData = await Notifications.getDevicePushTokenAsync();
        token = pushTokenData.data;
      } catch (e) {
        console.log("Push token error", e);
      }

      const res = await axios.post(`${BASE_URL}/login`, {
        email,
        password,
        fcm_token: token,
      });

      const user = res.data.user;

      if (res.status === 200 && user) {
        await AsyncStorage.setItem("userName", user.name);
        await AsyncStorage.setItem("userId", user.user_id.toString());
        navigation.replace("MainTabs", { user });
      }
    } catch (err) {
      setBackendError(err.response?.data?.message || "Invalid credentials");
    }
  };

  return (
    <LinearGradient colors={["#121026", "#1e1a3a"]} style={styles.container}>
      <StatusBar barStyle="light-content" />

      <Animatable.View animation="fadeInUp" duration={1000} style={styles.card}>
        <Text style={styles.title}>Welcome Back</Text>

        {/* EMAIL FIELD */}
        <TextInput
          placeholder="Email address"
          placeholderTextColor="rgba(255,255,255,0.4)"
          value={email}
          onChangeText={validateEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
        />
        {emailError ? <Text style={styles.errorHint}>{emailError}</Text> : null}

        {/* PASSWORD FIELD */}
        <View style={styles.passwordContainer}>
          <TextInput
            placeholder="Password"
            placeholderTextColor="rgba(255,255,255,0.4)"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (passwordError) setPasswordError("");
            }}
            style={[styles.input, { flex: 1, borderWidth: 0, marginVertical: 0 }]}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons
              name={showPassword ? "eye" : "eye-off"}
              size={18}
              color="#00d2ff"
              style={{ marginRight: 10 }}
            />
          </TouchableOpacity>
        </View>
        {passwordError ? (
          <Text style={styles.errorHint}>{passwordError}</Text>
        ) : null}
        {backendError ? (
          <Text style={styles.errorHint}>{backendError}</Text>
        ) : null}

        {/* LOGIN BUTTON (pill shape, same gradient as Signup) */}
        <Animatable.View
          animation="pulse"
          iterationCount="infinite"
          duration={3000}
          style={styles.buttonWrapper}
        >
          <TouchableOpacity activeOpacity={0.8} onPress={handleLogin}>
            <LinearGradient
              colors={["#00d2ff", "#3a7bd5"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientButton}
            >
              <Text style={styles.buttonText}>Login</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animatable.View>

        {/* SIGN UP LINK */}
        <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
          <Text style={styles.linkText}>
            Don’t have an account?{" "}
            <Text style={{ color: "#00d2ff", fontWeight: "bold" }}>Sign up</Text>
          </Text>
        </TouchableOpacity>
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
  card: {
    width: "92%",
    borderRadius: 30,
    padding: 25,
    backgroundColor: "#1e1a3a",
    borderWidth: 1,
    borderColor: "rgba(0, 210, 255, 0.1)",
    elevation: 20,
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowRadius: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 20,
    letterSpacing: 1,
  },
  input: {
    color: "#fff",
    borderRadius: 15,
    paddingHorizontal: 15,
    marginVertical: 6,
    height: 50,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 15,
    marginVertical: 6,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  buttonWrapper: {
    marginTop: 25,
    shadowColor: "#00d2ff",
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  gradientButton: {
    paddingVertical: 14,
    alignItems: "center",
    borderRadius: 40,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  linkText: {
    marginTop: 20,
    textAlign: "center",
    color: "rgba(255,255,255,0.5)",
    fontSize: 13,
  },
  errorHint: {
    color: "#f87171",
    fontSize: 12,
    marginLeft: 10,
    marginBottom: 4,
    fontWeight: "500",
  },
});