import React, { useEffect } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  Dimensions, 
  Image, 
  ActivityIndicator, 
  Platform, 
  StatusBar 
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Animatable from "react-native-animatable";

const { width } = Dimensions.get("window");

const SplashScreen = ({ navigation }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace("Welcome");
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <LinearGradient
      colors={["#121026", "#1e1a3a"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      <View style={styles.content}>
        {/* Logo with glow - no extra circle */}
        <Animatable.View
          animation="zoomIn"
          duration={1200}
          style={styles.logoContainer}
        >
          <Image
            source={require("../assets/nexus_icon.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animatable.View>
      </View>

      <Animatable.View
        animation="fadeIn"
        duration={800}
        delay={800}
        style={styles.loaderContainer}
      >
        <ActivityIndicator size="small" color="#00d2ff" />
        <Text style={styles.loadingText}>Loading...</Text>
      </Animatable.View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#00d2ff",
        shadowOpacity: 0.6,
        shadowRadius: 25,
        shadowOffset: { width: 0, height: 0 },
      },
      android: {
        elevation: 20,
      },
      web: {
        filter: "drop-shadow(0px 0px 25px rgba(0,210,255,0.6))",
      },
    }),
  },
  logo: {
    width: width * 0.9,
    height: width * 0.9,
  },
  loaderContainer: {
    position: "absolute",
    bottom: 80,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  loadingText: {
    color: "#fff",
    marginTop: 8,
    fontSize: 13,
    opacity: 0.8,
    letterSpacing: 1,
  },
});

export default SplashScreen;