import { registerRootComponent } from "expo";
import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance } from '@notifee/react-native';
import App from "./App";

// ✅ 1. Background Message Handler (App register hone se pehle)
messaging().setBackgroundMessageHandler(async (remoteMessage) => {
    console.log('🔔 Background Message Received:', remoteMessage);

    const { title, body, userId, category } = remoteMessage.data;

    // Notification Channel setup
    await notifee.createChannel({
        id: 'default',
        name: 'Default Channel',
        importance: AndroidImportance.HIGH,
    });

    // Display Notification with Buttons
    await notifee.displayNotification({
        title: title || "Nexus Shield Alert",
        body: body || "Security check needed.",
        data: { userId, category },
        android: {
            channelId: 'default',
            importance: AndroidImportance.HIGH,
            pressAction: {
                id: 'default',
            },
            actions: [
                { title: '✅ Mark as Read', pressAction: { id: 'read' } },
                { title: '❌ Dismiss', pressAction: { id: 'dismiss' } },
            ],
        },
    });
});

// ✅ 2. Register the main component
registerRootComponent(App);

export default App;