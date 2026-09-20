import 'react-native-gesture-handler';
import React from 'react';
import { Platform, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import SplashScreen from "./screens/SplashScreen";
import WelcomeScreen from "./screens/WelcomeScreen";
import IncidentScreen from './screens/IncidentScreen';
import LoginScreen from './screens/Login';
import SignupScreen from './screens/Signup';
import HomeScreen from './screens/HomeScreen';
import TrainingLessonScreen from './screens/TrainingLessonScreen';
import ProgressReportScreen from './screens/ProgressReportScreen';
import ProfileScreen from './screens/ProfileScreen';
import BlogScreen from './screens/BlogScreen';
import NewsScreen from './screens/NewsScreen';
import ArticleScreen from './screens/ArticleScreen';
import FlashCardScreen from "./screens/FlashCardScreen";  
import QuizScreen from './screens/QuizScreen';
import LinkCheckerScreen from   "./screens/LinkCheckerScreen";
import SurveyScreen from './screens/SurveyScreen'; 
import ResultScreen from './screens/ResultScreen';
import * as Device from 'expo-device';
import PrivacyPolicy from "./screens/PrivacyPolicy";
import AboutUsScreen from "./screens/AboutUsScreen";
import Termsconditions from "./screens/Termsconditions";
import AwarenessScreen from './screens/AwarenessScreen';
import { ThemeProvider } from './context/ThemeContext'; 
import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance, EventType, AndroidStyle } from '@notifee/react-native';
import { useEffect } from 'react';
import { BASE_URL } from './config';
notifee.onBackgroundEvent(async ({ type, detail }) => {
  const { notification, pressAction } = detail;

  if (type === EventType.ACTION_PRESS && pressAction.id) {
    try {
      await fetch('${BASE_URL}/api/nudge-interaction', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json' // 👈 Ye add karna lazmi hai yahan bhi
        },
        body: JSON.stringify({
          userId: notification.data.userId,
          category: notification.data.category,
          action: pressAction.id,
        }),
      });
    } catch (e) {
      console.error("Background update error:", e);
    }
  }
});
const RootView = Platform.OS === 'web' ? React.Fragment : GestureHandlerRootView;
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// ✅ Footer Tabs (appear after login)
function MainTabs({ route }) {
  const user = route.params?.user; // user data from login
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#011627',
          borderTopColor: '#00ffff',
        },
        tabBarActiveTintColor: '#00ffff',
        tabBarInactiveTintColor: '#aaa',
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Home') iconName = 'home';
          else if (route.name === 'Training') iconName = 'school';
          else if (route.name === 'Progress') iconName = 'bar-chart';
          else if (route.name === 'Profile') iconName = 'person';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} initialParams={{ user }} />
      <Tab.Screen name="Training" component={TrainingLessonScreen} />
      <Tab.Screen name="Progress" component={ProgressReportScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
export default function App() {
 useEffect(() => {
    // Channel setup
    const setup = async () => {
      await notifee.createChannel({
        id: 'default',
        name: 'Default Channel',
        importance: AndroidImportance.HIGH,
      });
    };
    setup();
const getToken = async () => {
      const token = await messaging().getToken();
      console.log("🚀 NEW DEVICE TOKEN:", token); 
    };
    getToken();
    // Foreground listener
    const unsubMsg = messaging().onMessage(async (remoteMessage) => {
      console.log("📩 Message received in foreground:", remoteMessage.data);
      const { title, body, userId, category } = remoteMessage.data;
      await notifee.displayNotification({
        title,
        body,
        data: { userId, category },
        android: {
          channelId: 'default',
          importance: AndroidImportance.HIGH,// new add 
          style: { 
        type: AndroidStyle.BIGTEXT,// 0 = BigText style
        text: body 
      },//this one also new
          actions: [
            { title: '✅ Mark as Read', pressAction: { id: 'read' } },
            { title: '❌ Dismiss', pressAction: { id: 'dismiss' } },
          ],
        },
      });
    });

 
const unsubNotifee = notifee.onForegroundEvent(({ type, detail }) => {
  const { userId, category } = detail.notification.data;

  // Jab user button click kare (Read ya Dismiss)
  if (type === EventType.ACTION_PRESS) {
    const actionId = detail.pressAction.id;
    sendInteractionToBackend(userId, category, actionId);
  }
  
  // Jab user notification ko swipe karke hataye (Failure track karne ke liye)
  if (type === EventType.DISMISSED) {
    sendInteractionToBackend(userId, category, 'dismiss');
  }
});
    return () => {
      unsubMsg();
      unsubNotifee();
    };
  }, []);

const sendInteractionToBackend = async (userId, category, action) => {
    if(!userId) return;

    try {
      const response = await fetch('${BASE_URL}/api/nudge-interaction', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json' 
        },
        body: JSON.stringify({ userId, category, action })
      });
      
      const data = await response.json();
      console.log(`📊 AI Updated! Action: ${action} | New Success Rate: ${data.current_success_rate}`);
    } catch (error) {
      console.error("⚠️ Backend update failed:", error);
    }
};  
  // --- Baqi return statement (NavigationContainer etc) ---
 
  return (
    <ThemeProvider>
    <RootView style={{ flex: 1 }}>
      <NavigationContainer>
         <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
           <Stack.Screen name="Awareness" component={AwarenessScreen} />
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen name="Incidents" component={IncidentScreen} /> 
          <Stack.Screen name="LinkCheckerScreen" component={LinkCheckerScreen} /> 
          <Stack.Screen name="Blog" component={BlogScreen} />
          <Stack.Screen name="News" component={NewsScreen} />
          <Stack.Screen name="Article" component={ArticleScreen} />
          <Stack.Screen name="TrainingLesson" component={TrainingLessonScreen} />
          <Stack.Screen name="ProgressReport" component={ProgressReportScreen} />
          <Stack.Screen name="FlashCard" component={FlashCardScreen}  />
          <Stack.Screen name="Quiz" component={QuizScreen} options={{ headerShown: false }} />

          <Stack.Screen name="Survey" component={SurveyScreen} />
           
          <Stack.Screen name="Result" component={ResultScreen} />

          <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicy} options={{ headerShown: false }} />
          <Stack.Screen name="AboutUs" component={AboutUsScreen}  options={{ headerShown: false }} />
          <Stack.Screen name="Termsconditions" component={Termsconditions}  options={{ headerShown: false }} />
        </Stack.Navigator>
      </NavigationContainer>
    </RootView>
    </ThemeProvider>
  );
}