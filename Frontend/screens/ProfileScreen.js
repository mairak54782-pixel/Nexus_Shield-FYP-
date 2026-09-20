import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TextInput,
  Modal,
  ActivityIndicator,
  Linking,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, Feather, MaterialIcons } from "@expo/vector-icons";
import * as Animatable from "react-native-animatable";
import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from "../context/ThemeContext";
import { BASE_URL } from '../config';

const ProfileScreen = ({ navigation }) => {
  const { theme, isDark, toggleTheme } = useTheme();
  // ... all state declarations remain the same ...
  const [user, setUser] = useState({ name: "", email: "" });
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMsg, setSuccessMsg] = useState("Updated!");
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [helpSheetVisible, setHelpSheetVisible] = useState(false);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [suggestModalVisible, setSuggestModalVisible] = useState(false);
  const [reportMessage, setReportMessage] = useState("");
  const [suggestMessage, setSuggestMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isSendingSuggest, setIsSendingSuggest] = useState(false);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [themeSheetVisible, setThemeSheetVisible] = useState(false);

  const API_URL = "${BASE_URL}";

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const storedId = await AsyncStorage.getItem('userId');
      if (!storedId) {
        navigation.replace("Login");
        return;
      }
      const response = await axios.get(`${API_URL}/api/user/${storedId}`);
      const { name, email } = response.data;
      setUser({ name, email });
      setEditName(name);
      setEditEmail(email);
    } catch (error) {
      triggerError("Unable to fetch data.");
    } finally {
      setLoading(false);
    }
  };

  const triggerSuccess = (msg) => {
    setSuccessMsg(msg);
    setShowSuccessModal(true);
    setTimeout(() => setShowSuccessModal(false), 2000);
  };

  const triggerError = (msg) => {
    setErrorMsg(msg);
    setShowErrorModal(true);
    setTimeout(() => setShowErrorModal(false), 2500);
  };

  const handleSendReport = async () => {
    if (!reportMessage.trim()) {
      triggerError("Please write something to report.");
      return;
    }
    setIsSending(true);
    try {
      const storedId = await AsyncStorage.getItem('userId');
      await axios.post(`${API_URL}/api/report-content`, {
        userId: storedId,
        userName: user.name,
        message: reportMessage,
        timestamp: new Date()
      });
      setReportModalVisible(false);
      setReportMessage("");
      triggerSuccess("Report Sent!");
    } catch (error) {
      triggerError("Could not send report.");
    } finally {
      setIsSending(false);
    }
  };

  const handleSendSuggestion = async () => {
    if (!suggestMessage.trim()) {
      triggerError("Please write your suggestion.");
      return;
    }
    setIsSendingSuggest(true);
    try {
      const storedId = await AsyncStorage.getItem('userId');
      await axios.post(`${API_URL}/api/suggest-improvement`, {
        userId: storedId,
        userName: user.name,
        message: suggestMessage,
        timestamp: new Date()
      });
      setSuggestModalVisible(false);
      setSuggestMessage("");
      triggerSuccess("Suggestion Sent!");
    } catch (error) {
      triggerError("Could not send suggestion.");
    } finally {
      setIsSendingSuggest(false);
    }
  };

  const handleSave = async () => {
    try {
      const storedId = await AsyncStorage.getItem('userId');
      const response = await axios.put(`${API_URL}/api/update-profile/${storedId}`, {
        name: editName,
        email: editEmail
      });
      if (response.data.status === "success") {
        setUser({ name: editName, email: editEmail });
        setEditModalVisible(false);
        triggerSuccess("Updated!");
      }
    } catch (error) {
      triggerError("Update failed.");
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            try {
              const storedId = await AsyncStorage.getItem('userId');
              if (storedId) {
                await axios.post(`${API_URL}/api/logout/${storedId}`);
              }
              await AsyncStorage.clear();
              navigation.replace("Login");
            } catch (error) {
              await AsyncStorage.clear();
              navigation.replace("Login");
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.accent} />
      </View>
    );
  }

  return (
    <LinearGradient colors={theme.gradient} style={styles.container}>
      <StatusBar barStyle={theme.statusBar} />
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={26} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerText, { color: theme.text }]}>My Account</Text>
          <View style={{ width: 26 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          {/* Profile Card */}
          <View style={[styles.profileCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <View style={[styles.avatar, { backgroundColor: theme.accent }]}>
              <Text style={styles.avatarText}>{user.name ? user.name.charAt(0).toUpperCase() : "U"}</Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={[styles.name, { color: theme.text }]}>{user.name}</Text>
              <Text style={[styles.email, { color: isDark ? "#d0d0d0" : "#666666" }]}>{user.email}</Text>
            </View>
            <TouchableOpacity style={styles.editIcon} onPress={() => setEditModalVisible(true)}>
              <Feather name="edit-2" size={20} color={theme.accent} />
            </TouchableOpacity>
          </View>

          {/* Preferences */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.accent }]}>Preferences</Text>
            <View style={[styles.optionBox, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
              <Option icon="color-palette-outline" text="Theme" onPress={() => setThemeSheetVisible(true)} theme={theme} />
            </View>
          </View>

          {/* Legal */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.accent }]}>Legal</Text>
            <View style={[styles.optionBox, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
              <Option icon="document-text-outline" text="Privacy Policy" onPress={() => navigation.navigate("PrivacyPolicy")} theme={theme} />
              <Option icon="clipboard-outline" text="Terms & Conditions" onPress={() => navigation.navigate("Termsconditions")} theme={theme} />
            </View>
          </View>

          {/* Support */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.accent }]}>Support</Text>
            <View style={[styles.optionBox, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
              <Option icon="information-circle-outline" text="About us" onPress={() => navigation.navigate('AboutUs')} theme={theme} />
              <Option icon="help-circle-outline" text="Help & Resources" onPress={() => setHelpSheetVisible(true)} theme={theme} />
            </View>
          </View>

          {/* Logout Button */}
          <TouchableOpacity style={[styles.logoutBtn, { borderColor: "#ff6b6b", backgroundColor: theme.card }]} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={22} color="#ff6b6b" />
            <Text style={[styles.logoutText, { color: "#ff6b6b" }]}>Logout</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Theme Bottom Sheet */}
        <Modal transparent visible={themeSheetVisible} animationType="fade" onRequestClose={() => setThemeSheetVisible(false)}>
          <TouchableOpacity style={styles.sheetOverlay} activeOpacity={1} onPress={() => setThemeSheetVisible(false)}>
            <Animatable.View animation="slideInUp" duration={400} style={[styles.bottomSheet, { backgroundColor: theme.card, borderTopColor: theme.accent }]}>
              <View style={styles.sheetHandle} />
              <View style={styles.sheetHeader}>
                <Text style={[styles.sheetTitle, { color: theme.text }]}>Select Theme</Text>
                <TouchableOpacity onPress={() => setThemeSheetVisible(false)}><Ionicons name="close" size={24} color={theme.text} /></TouchableOpacity>
              </View>
              <View style={styles.sheetContent}>
                <TouchableOpacity style={styles.sheetOption} onPress={() => {
                  if (isDark) toggleTheme();
                  setThemeSheetVisible(false);
                }}>
                  <Ionicons name="sunny-outline" size={22} color={theme.accent} />
                  <Text style={[styles.sheetOptionText, { color: theme.text }]}>Light Mode</Text>
                  {!isDark && <Ionicons name="checkmark-circle" size={20} color={theme.accent} style={{ marginLeft: 'auto' }} />}
                </TouchableOpacity>
                <TouchableOpacity style={styles.sheetOption} onPress={() => {
                  if (!isDark) toggleTheme();
                  setThemeSheetVisible(false);
                }}>
                  <Ionicons name="moon-outline" size={22} color={theme.accent} />
                  <Text style={[styles.sheetOptionText, { color: theme.text }]}>Dark Mode</Text>
                  {isDark && <Ionicons name="checkmark-circle" size={20} color={theme.accent} style={{ marginLeft: 'auto' }} />}
                </TouchableOpacity>
              </View>
            </Animatable.View>
          </TouchableOpacity>
        </Modal>

        {/* Help & Resources Bottom Sheet */}
        <Modal transparent visible={helpSheetVisible} animationType="fade" onRequestClose={() => setHelpSheetVisible(false)}>
          <TouchableOpacity style={styles.sheetOverlay} activeOpacity={1} onPress={() => setHelpSheetVisible(false)}>
            <Animatable.View animation="slideInUp" duration={400} style={[styles.bottomSheet, { backgroundColor: theme.card, borderTopColor: theme.accent }]}>
              <View style={styles.sheetHandle} />
              <View style={styles.sheetHeader}>
                <Text style={[styles.sheetTitle, { color: theme.text }]}>Help & Resources</Text>
                <TouchableOpacity onPress={() => setHelpSheetVisible(false)}><Ionicons name="close" size={24} color={theme.text} /></TouchableOpacity>
              </View>
              <View style={styles.sheetContent}>
                <TouchableOpacity style={styles.sheetOption} onPress={() => {
                    setHelpSheetVisible(false);
                    Linking.openURL('mailto:support@nexusshield.com?subject=Help Assistant');
                }}>
                  <Ionicons name="mail-outline" size={22} color={theme.accent} />
                  <Text style={[styles.sheetOptionText, { color: theme.text }]}>Help Assistant</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.sheetOption} onPress={() => {
                    setHelpSheetVisible(false);
                    setReportModalVisible(true);
                }}>
                  <Ionicons name="chatbubble-ellipses-outline" size={22} color={theme.accent} />
                  <Text style={[styles.sheetOptionText, { color: theme.text }]}>Report content</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.sheetOption} onPress={() => {
                    setHelpSheetVisible(false);
                    setSuggestModalVisible(true);
                }}>
                  <Ionicons name="bulb-outline" size={22} color={theme.accent} />
                  <Text style={[styles.sheetOptionText, { color: theme.text }]}>Suggest Improvement</Text>
                </TouchableOpacity>
              </View>
            </Animatable.View>
          </TouchableOpacity>
        </Modal>

        {/* Edit Profile Modal - FIXED Cancel Button */}
        <Modal transparent visible={editModalVisible} animationType="slide">
          <View style={styles.modalContainer}>
            <View style={[styles.modalBox, { backgroundColor: theme.card, borderColor: theme.accent }]}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Edit Profile</Text>
              <TextInput style={[styles.input, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border }]} placeholder="Name" placeholderTextColor={theme.placeholder} value={editName} onChangeText={setEditName} />
              <TextInput style={[styles.input, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border }]} placeholder="Email" placeholderTextColor={theme.placeholder} value={editEmail} onChangeText={setEditEmail} />
              <View style={styles.modalButtons}>
                <TouchableOpacity style={[styles.cancelBtn, { backgroundColor: theme.inputBg }]} onPress={() => setEditModalVisible(false)}>
                  <Text style={[styles.cancelText, { color: theme.text }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.saveBtn, { backgroundColor: theme.accent }]} onPress={handleSave}>
                  <Text style={styles.saveText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Report Modal - FIXED Cancel Button */}
        <Modal transparent visible={reportModalVisible} animationType="slide">
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalContainer}>
            <View style={[styles.modalBox, { backgroundColor: theme.card, borderColor: theme.accent }]}>
              <View style={styles.chatHeader}>
                <Text style={[styles.modalTitle, { color: theme.text }]}>Report Issue</Text>
                <TouchableOpacity onPress={() => setReportModalVisible(false)}><Ionicons name="close" size={24} color={theme.text} /></TouchableOpacity>
              </View>
              <TextInput
                style={[styles.input, { height: 120, textAlignVertical: "top", backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border }]}
                placeholder="Describe the content or issue..."
                placeholderTextColor={theme.placeholder}
                multiline
                value={reportMessage}
                onChangeText={setReportMessage}
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity style={[styles.cancelBtn, { backgroundColor: theme.inputBg }]} onPress={() => setReportModalVisible(false)}>
                  <Text style={[styles.cancelText, { color: theme.text }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.saveBtn, { backgroundColor: theme.accent }]} onPress={handleSendReport} disabled={isSending}>
                  {isSending ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveText}>Send Report</Text>}
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>

        {/* Suggest Improvement Modal - FIXED Cancel Button */}
        <Modal transparent visible={suggestModalVisible} animationType="slide">
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalContainer}>
            <View style={[styles.modalBox, { backgroundColor: theme.card, borderColor: theme.accent }]}>
              <View style={styles.chatHeader}>
                <Text style={[styles.modalTitle, { color: theme.text }]}>Suggest Improvement</Text>
                <TouchableOpacity onPress={() => setSuggestModalVisible(false)}><Ionicons name="close" size={24} color={theme.text} /></TouchableOpacity>
              </View>
              <TextInput
                style={[styles.input, { height: 120, textAlignVertical: "top", backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.border }]}
                placeholder="Share your idea to make NexorShield better..."
                placeholderTextColor={theme.placeholder}
                multiline
                value={suggestMessage}
                onChangeText={setSuggestMessage}
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity style={[styles.cancelBtn, { backgroundColor: theme.inputBg }]} onPress={() => setSuggestModalVisible(false)}>
                  <Text style={[styles.cancelText, { color: theme.text }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.saveBtn, { backgroundColor: theme.accent }]} onPress={handleSendSuggestion} disabled={isSendingSuggest}>
                  {isSendingSuggest ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveText}>Send Suggestion</Text>}
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>

        {/* Success & Error Modals */}
        <Modal transparent visible={showSuccessModal} animationType="fade">
          <View style={styles.successOverlay}>
            <Animatable.View animation="zoomIn" style={[styles.successBox, { backgroundColor: theme.card, borderColor: theme.accent }]}>
              <Ionicons name="checkmark-circle" size={60} color={theme.accent} />
              <Text style={[styles.successText, { color: theme.text }]}>{successMsg}</Text>
            </Animatable.View>
          </View>
        </Modal>

        <Modal transparent visible={showErrorModal} animationType="fade">
          <View style={styles.successOverlay}>
            <Animatable.View animation="zoomIn" style={[styles.successBox, { backgroundColor: theme.card, borderColor: '#ff4d4d' }]}>
              <Ionicons name="close-circle" size={60} color="#ff4d4d" />
              <Text style={[styles.successText, { color: '#ff4d4d' }]}>{errorMsg}</Text>
            </Animatable.View>
          </View>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
};

const Option = ({ icon, text, onPress, theme }) => (
  <TouchableOpacity style={styles.option} onPress={onPress} activeOpacity={0.6}>
    <View style={styles.optionLeft}>
      <Ionicons name={icon} size={22} color={theme.accent} />
      <Text style={[styles.optionText, { color: theme.text }]}>{text}</Text>
    </View>
    <MaterialIcons name="keyboard-arrow-right" size={24} color={theme.accent} />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, marginTop: 50, marginBottom: 10 },
  headerText: { fontSize: 22, fontWeight: "bold" },
  scrollContainer: { paddingHorizontal: 20, paddingBottom: 40 },
  profileCard: { borderRadius: 24, padding: 18, flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 30, borderWidth: 1 },
  avatar: { width: 60, height: 60, borderRadius: 30, alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#fff", fontSize: 24, fontWeight: "bold" },
  userInfo: { flex: 1, marginLeft: 15 },
  name: { fontSize: 18, fontWeight: "700" },
  email: { fontSize: 14, marginTop: 2 },
  editIcon: { padding: 8 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 14, fontWeight: "600", marginBottom: 8, marginLeft: 5, letterSpacing: 0.5 },
  optionBox: { borderRadius: 20, overflow: "hidden", borderWidth: 1 },
  option: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 14, paddingHorizontal: 18, borderBottomWidth: 1, borderBottomColor: "rgba(0,0,0,0.05)" },
  optionLeft: { flexDirection: "row", alignItems: "center" },
  optionText: { fontSize: 16, marginLeft: 12 },
  logoutBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 15, borderRadius: 20, borderWidth: 1, marginTop: 10 },
  logoutText: { fontSize: 16, fontWeight: "600", marginLeft: 8 },
  sheetOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" },
  bottomSheet: { borderTopLeftRadius: 25, borderTopRightRadius: 25, paddingHorizontal: 20, paddingBottom: 30, borderTopWidth: 1 },
  sheetHandle: { width: 40, height: 5, backgroundColor: "rgba(0,0,0,0.2)", borderRadius: 10, alignSelf: "center", marginVertical: 12 },
  sheetHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 15, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: "rgba(0,0,0,0.1)" },
  sheetTitle: { fontSize: 18, fontWeight: "bold" },
  sheetOption: { flexDirection: "row", alignItems: "center", paddingVertical: 15 },
  sheetOptionText: { fontSize: 16, marginLeft: 15, flex: 1 },
  modalContainer: { flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "center", alignItems: "center" },
  modalBox: { width: "85%", borderRadius: 24, padding: 22, borderWidth: 1 },
  modalTitle: { fontSize: 20, fontWeight: "600", marginBottom: 18, textAlign: "center" },
  input: { borderRadius: 12, padding: 12, marginVertical: 8, borderWidth: 1 },
  modalButtons: { flexDirection: "row", justifyContent: "space-between", marginTop: 20 },
  cancelBtn: { flex: 1, padding: 12, borderRadius: 12, alignItems: "center", marginRight: 10 },
  saveBtn: { flex: 1, padding: 12, borderRadius: 12, alignItems: "center", marginLeft: 10 },
  cancelText: { fontWeight: "500" },  // color now set dynamically
  saveText: { color: "#fff", fontWeight: "bold" },
  chatHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 15 },
  successOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.85)", justifyContent: "center", alignItems: "center" },
  successBox: { width: "75%", borderRadius: 24, padding: 28, alignItems: "center", borderWidth: 1 },
  successText: { marginTop: 15, fontSize: 18, fontWeight: "bold", textAlign: "center" },
});

export default ProfileScreen;