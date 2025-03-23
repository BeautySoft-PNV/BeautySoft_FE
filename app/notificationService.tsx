import AsyncStorage from "@react-native-async-storage/async-storage";

const checkForNewNotifications = async () => {
    const existingData = await AsyncStorage.getItem("notifications");
    if (!existingData) {
        await AsyncStorage.setItem("notifications", JSON.stringify([]));
    }
    try {
        const token = await AsyncStorage.getItem('token');
        if (!token) return;

        const response = await fetch("http://192.168.31.183:5280/api/notification/user/notification", {
            method: "GET",
            headers: {
                'Content-Type': 'application/json',
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error("Failed to fetch notifications");

        const newData = await response.json();
        const storedData = await AsyncStorage.getItem("notifications");
        const oldNotifications = storedData ? JSON.parse(storedData) : [];
        const newCount = newData.length;
        const oldCount = oldNotifications.length;

        if (newData.length === 0 && oldNotifications.length === 0) {
            await AsyncStorage.setItem("hasNewNotification", "false");
            return;
        }
        const isSameData = JSON.stringify(newData) === JSON.stringify(oldNotifications);
        if (!isSameData && newCount > oldCount) {
            await AsyncStorage.setItem("hasNewNotification", "true");
        }
        if (!isSameData) {
            await AsyncStorage.setItem("notifications", JSON.stringify(newData));
        }
    } catch (error) {
        console.error("Error checking notifications:", error);
    }
};



export const startNotificationService = () => {
    checkForNewNotifications();
    return setInterval(checkForNewNotifications, 10000);
};