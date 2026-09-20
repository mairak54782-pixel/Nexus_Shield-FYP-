// // screens/Termsconditions.js
// import React from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   TouchableOpacity,
//   SafeAreaView,
// } from 'react-native';
// import { LinearGradient } from 'expo-linear-gradient';
// import { Ionicons } from '@expo/vector-icons';

// const Termsconditions = ({ navigation }) => {
//   return (
//     <LinearGradient colors={["#000428", "#004e92"]} style={styles.container}>
//       <SafeAreaView style={{ flex: 1 }}>
//         {/* Header */}
//         <View style={styles.header}>
//           <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
//             <Ionicons name="arrow-back" size={26} color="#fff" />
//           </TouchableOpacity>
//           <Text style={styles.headerText}>Terms & Conditions</Text>
//           <View style={{ width: 26 }} />
//         </View>

//         <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
//           <Text style={styles.lastUpdated}>Effective date: May 2025</Text>

//           <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
//           <Text style={styles.paragraph}>
//             By accessing or using NexorShield, you agree to be bound by these Terms & Conditions. If you do not agree, please do not use the app.
//           </Text>

//           <Text style={styles.sectionTitle}>2. Eligibility</Text>
//           <Text style={styles.paragraph}>
//             You must be at least 13 years old to use this app. By using the app, you represent that you meet this requirement.
//           </Text>

//           <Text style={styles.sectionTitle}>3. User Responsibilities</Text>
//           <Text style={styles.paragraph}>
//             • You are responsible for maintaining the confidentiality of your account.{'\n'}
//             • You agree not to misuse the app or attempt to bypass security measures.{'\n'}
//             • You will not use the app for any illegal or unauthorised purpose.
//           </Text>

//           <Text style={styles.sectionTitle}>4. Intellectual Property</Text>
//           <Text style={styles.paragraph}>
//             All content, features, and functionality of the app (including but not limited to text, graphics, logos, and software) are owned by NexorShield and are protected by copyright and other intellectual property laws.
//           </Text>

//           <Text style={styles.sectionTitle}>5. Termination</Text>
//           <Text style={styles.paragraph}>
//             We may suspend or terminate your account if you violate these terms. You may delete your account at any time from the app settings.
//           </Text>

//           <Text style={styles.sectionTitle}>6. Limitation of Liability</Text>
//           <Text style={styles.paragraph}>
//             NexorShield is provided "as is" without warranties of any kind. We shall not be liable for any indirect, incidental, or consequential damages arising from your use of the app.
//           </Text>

//           <Text style={styles.sectionTitle}>7. Changes to Terms</Text>
//           <Text style={styles.paragraph}>
//             We may modify these terms at any time. Continued use of the app after changes constitutes acceptance of the new terms.
//           </Text>

//           <Text style={styles.sectionTitle}>8. Contact Us</Text>
//           <Text style={styles.paragraph}>
//             If you have any questions about these Terms, please contact us at support@nexusshield.com.
//           </Text>

//           <Text style={styles.footerText}>
//             © 2025 NexorShield. All rights reserved.
//           </Text>
//         </ScrollView>
//       </SafeAreaView>
//     </LinearGradient>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1 },
//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     paddingHorizontal: 20,
//     marginTop: 50,
//     marginBottom: 10,
//   },
//   headerText: { fontSize: 22, color: "#fff", fontWeight: "bold" },
//   content: {
//     paddingHorizontal: 22,
//     paddingBottom: 40,
//   },
//   lastUpdated: {
//     color: "#aaa",
//     fontSize: 13,
//     marginBottom: 20,
//     textAlign: "center",
//   },
//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: "bold",
//     color: "#00C6FF",
//     marginTop: 20,
//     marginBottom: 8,
//   },
//   paragraph: {
//     fontSize: 15,
//     lineHeight: 24,
//     color: "#fff",
//     marginBottom: 12,
//   },
//   footerText: {
//     fontSize: 14,
//     color: "#aaa",
//     textAlign: "center",
//     marginTop: 30,
//     marginBottom: 20,
//   },
// });

// export default Termsconditions;  


// screens/Termsconditions.js
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

const Termsconditions = ({ navigation }) => {
  const { theme, isDark } = useTheme();

  return (
    <LinearGradient colors={theme.gradient} style={styles.container}>
      <StatusBar barStyle={theme.statusBar} />
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={26} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerText, { color: theme.text }]}>Terms & Conditions</Text>
          <View style={{ width: 26 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={[styles.lastUpdated, { color: theme.placeholder }]}>Effective date: May 2025</Text>

          <Text style={[styles.sectionTitle, { color: theme.accent }]}>1. Acceptance of Terms</Text>
          <Text style={[styles.paragraph, { color: theme.text }]}>
            By accessing or using NexusShield, you agree to be bound by these Terms & Conditions. If you do not agree, please do not use the app.
          </Text>

          <Text style={[styles.sectionTitle, { color: theme.accent }]}>2. Eligibility</Text>
          <Text style={[styles.paragraph, { color: theme.text }]}>
            You must be at least 13 years old to use this app. By using the app, you represent that you meet this requirement.
          </Text>

          <Text style={[styles.sectionTitle, { color: theme.accent }]}>3. User Responsibilities</Text>
          <Text style={[styles.paragraph, { color: theme.text }]}>
            • You are responsible for maintaining the confidentiality of your account.{'\n'}
            • You agree not to misuse the app or attempt to bypass security measures.{'\n'}
            • You will not use the app for any illegal or unauthorised purpose.
          </Text>

          <Text style={[styles.sectionTitle, { color: theme.accent }]}>4. Intellectual Property</Text>
          <Text style={[styles.paragraph, { color: theme.text }]}>
            All content, features, and functionality of the app (including but not limited to text, graphics, logos, and software) are owned by NexorShield and are protected by copyright and other intellectual property laws.
          </Text>

          <Text style={[styles.sectionTitle, { color: theme.accent }]}>5. Termination</Text>
          <Text style={[styles.paragraph, { color: theme.text }]}>
            We may suspend or terminate your account if you violate these terms. You may delete your account at any time from the app settings.
          </Text>

          <Text style={[styles.sectionTitle, { color: theme.accent }]}>6. Limitation of Liability</Text>
          <Text style={[styles.paragraph, { color: theme.text }]}>
            NexorShield is provided "as is" without warranties of any kind. We shall not be liable for any indirect, incidental, or consequential damages arising from your use of the app.
          </Text>

          <Text style={[styles.sectionTitle, { color: theme.accent }]}>7. Changes to Terms</Text>
          <Text style={[styles.paragraph, { color: theme.text }]}>
            We may modify these terms at any time. Continued use of the app after changes constitutes acceptance of the new terms.
          </Text>

          <Text style={[styles.sectionTitle, { color: theme.accent }]}>8. Contact Us</Text>
          <Text style={[styles.paragraph, { color: theme.text }]}>
            If you have any questions about these Terms, please contact us at support@nexusshield.com.
          </Text>

          <Text style={[styles.footerText, { color: theme.placeholder }]}>
            © 2025 NexorShield. All rights reserved.
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

export default Termsconditions;