import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  Modal,
  FlatList,
  StatusBar,
} from "react-native";
import axios from "axios";
import * as Animatable from "react-native-animatable";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from '../config';

export default function SignupScreen({ navigation }) {
  // --- States ---
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [role, setRole] = useState("student");
  const [showModal, setShowModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Touched states for validation (to avoid showing errors prematurely)
  const [nameTouched, setNameTouched] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [confirmTouched, setConfirmTouched] = useState(false);

  const roles = [
    { label: "Student", value: "student" },
    { label: "Teacher", value: "teacher" },
    { label: "Researcher", value: "researcher" },
    { label: "Employee", value: "employee" },
    { label: "General person", value: "general" },
  ];

  // ----- VALIDATION FUNCTIONS -----
  const isValidEmail = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  const isStrongPassword = (val) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(val);

  const handleSignup = async () => {
    // Mark all fields as touched when signing up
    setNameTouched(true);
    setEmailTouched(true);
    setPasswordTouched(true);
    setConfirmTouched(true);

    // 1. Empty Check
    if (!name || !email || !password || !confirmPassword) {
      return Alert.alert("Error", "Please fill all fields");
    }
    // 2. Email Validation
    if (!isValidEmail(email)) {
      return Alert.alert("Error", "Please enter a valid email address");
    }
    // 3. Password Strength
    if (!isStrongPassword(password)) {
      return Alert.alert("Weak Password", "Use 8+ characters with uppercase, lowercase, numbers, and symbols");
    }
    // 4. Password Matching
    if (password !== confirmPassword) {
      return Alert.alert("Error", "Passwords do not match");
    }

    try {
      let token = "";
      try {
        const pushTokenData = await Notifications.getDevicePushTokenAsync();
        token = pushTokenData.data;
      } catch (e) {
        console.log("Push token error");
      }

      const res = await axios.post(`${BASE_URL}/signup`, {
        name,
        email,
        password,
        role,
        fcm_token: token,
      });

      if (res.data.message === "User registered successfully") {
        setShowSuccessModal(true);
        await AsyncStorage.setItem("userId", res.data.user_id.toString());
        await AsyncStorage.setItem("userName", name);

        setTimeout(() => {
          setShowSuccessModal(false);
          navigation.replace("Awareness", { userId: res.data.user_id });
        }, 1500);
      }
    } catch (err) {
      Alert.alert("Error", err.response?.data?.message || "Signup failed");
    }
  };

  return (
    <LinearGradient colors={["#121026", "#1e1a3a"]} style={styles.container}>
      <StatusBar barStyle="light-content" />

      <Animatable.View animation="fadeInUp" duration={1000} style={styles.card}>
        <Text style={styles.title}>Create Account</Text>

        {/* NAME FIELD */}
        <TextInput
          placeholder="Full Name"
          placeholderTextColor="rgba(255,255,255,0.4)"
          value={name}
          onChangeText={setName}
          onBlur={() => setNameTouched(true)}
          style={styles.input}
        />
        {nameTouched && !name && <Text style={styles.errorHint}>Name is required</Text>}

        {/* EMAIL FIELD */}
        <TextInput
          placeholder="Email address"
          placeholderTextColor="rgba(255,255,255,0.4)"
          value={email}
          onChangeText={setEmail}
          onBlur={() => setEmailTouched(true)}
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
        />
        {emailTouched && email.length > 0 && !isValidEmail(email) && (
          <Text style={styles.errorHint}>Enter a valid email</Text>
        )}
        {emailTouched && !email && <Text style={styles.errorHint}>Email is required</Text>}

        {/* PASSWORD FIELD */}
        <View style={styles.passwordContainer}>
          <TextInput
            placeholder="Password"
            placeholderTextColor="rgba(255,255,255,0.4)"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
            onBlur={() => setPasswordTouched(true)}
            style={[styles.input, { flex: 1, borderWidth: 0, marginVertical: 0 }]}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons name={showPassword ? "eye" : "eye-off"} size={18} color="#00d2ff" style={{ marginRight: 10 }} />
          </TouchableOpacity>
        </View>
        {passwordTouched && password.length > 0 && (
          <Text style={[styles.errorHint, { color: isStrongPassword(password) ? "#4ade80" : "#f87171" }]}>
            {isStrongPassword(password) ? "✓ Strong password" : "Weak: use A-Z, a-z, 0-9 & symbol (min 8)"}
          </Text>
        )}
        {passwordTouched && !password && <Text style={styles.errorHint}>Password is required</Text>}

        {/* CONFIRM PASSWORD FIELD */}
        <View style={styles.passwordContainer}>
          <TextInput
            placeholder="Confirm password"
            placeholderTextColor="rgba(255,255,255,0.4)"
            secureTextEntry={!showConfirmPassword}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            onBlur={() => setConfirmTouched(true)}
            style={[styles.input, { flex: 1, borderWidth: 0, marginVertical: 0 }]}
          />
          <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
            <Ionicons name={showConfirmPassword ? "eye" : "eye-off"} size={18} color="#00d2ff" style={{ marginRight: 10 }} />
          </TouchableOpacity>
        </View>
        {confirmTouched && confirmPassword.length > 0 && password !== confirmPassword && (
          <Text style={styles.errorHint}>Passwords do not match</Text>
        )}
        {confirmTouched && !confirmPassword && <Text style={styles.errorHint}>Please confirm your password</Text>}

        {/* ROLE DROPDOWN */}
        <Text style={styles.label}>Select Your Role</Text>
        <TouchableOpacity style={styles.dropdown} onPress={() => setShowModal(true)}>
          <Text style={styles.dropdownText}>{roles.find((r) => r.value === role)?.label}</Text>
          <Ionicons name="chevron-down" size={18} color="#00d2ff" />
        </TouchableOpacity>

        {/* SIGN UP BUTTON */}
        <Animatable.View animation="pulse" iterationCount="infinite" duration={3000} style={styles.buttonWrapper}>
          <TouchableOpacity activeOpacity={0.8} onPress={handleSignup}>
            <LinearGradient colors={["#00d2ff", "#3a7bd5"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.gradientButton}>
              <Text style={styles.buttonText}>Signup</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animatable.View>

        {/* LOGIN LINK */}
        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
          <Text style={styles.linkText}>
            Already have an account <Text style={{ color: "#00d2ff", fontWeight: "bold" }}>Login</Text>
          </Text>
        </TouchableOpacity>
      </Animatable.View>

      {/* ROLE MODAL */}
      <Modal transparent visible={showModal} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <FlatList
              data={roles}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.option, item.value === role && styles.selectedOption]}
                  onPress={() => {
                    setRole(item.value);
                    setShowModal(false);
                  }}
                >
                  <Text style={[styles.optionText, item.value === role && { color: "#00d2ff", fontWeight: "bold" }]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* SUCCESS MODAL - Fixed styling */}
      <Modal transparent visible={showSuccessModal} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.successBox}>
            <Ionicons name="checkmark-circle" size={80} color="#0d9eec" />
            <Text style={styles.successText}>Account created successfully!</Text>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 20 },
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
  title: { fontSize: 28, fontWeight: "bold", color: "#fff", textAlign: "center", marginBottom: 20, letterSpacing: 1 },
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
  label: { color: "#00d2ff", fontSize: 13, marginTop: 12, marginBottom: 5, marginLeft: 5, fontWeight: "600" },
  dropdown: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 15,
    paddingHorizontal: 15,
    height: 50,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  dropdownText: { color: "#fff", fontSize: 14 },
  buttonWrapper: { marginTop: 25, shadowColor: "#00d2ff", shadowOpacity: 0.5, shadowRadius: 10, elevation: 8 },
  gradientButton: { paddingVertical: 14, alignItems: "center", borderRadius: 40 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold", letterSpacing: 1 },
  linkText: { marginTop: 20, textAlign: "center", color: "rgba(255,255,255,0.5)", fontSize: 13 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.8)", justifyContent: "center", alignItems: "center" },
  modalBox: { width: "80%", backgroundColor: "#1e1a3a", borderRadius: 20, padding: 10, borderWidth: 1, borderColor: "#00d2ff" },
  option: { padding: 15, alignItems: "center" },
  selectedOption: { backgroundColor: "rgba(0, 210, 255, 0.1)", borderRadius: 12 },
  optionText: { color: "#fff", fontSize: 16 },
  // Fixed success modal styles
  successBox: {
    width: "80%", // fixed width for consistent sizing
    backgroundColor: "#1e1a3a",
    paddingVertical: 40,
    paddingHorizontal: 20,
    borderRadius: 30,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#4ade80",
  },
  successText: {
    color: "#fff",
    marginTop: 15,
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center", // ensures text is centered
  },
  errorHint: {
    color: "#f87171",
    fontSize: 12,
    marginLeft: 10,
    marginBottom: 4,
    fontWeight: "500",
  },
});