import AsyncStorage from "@react-native-async-storage/async-storage";

const checkForNewNotifications = async () => {
    const existingData = await AsyncStorage.getItem("notifications");
    if (!existingData) {
        await AsyncStorage.setItem("notifications", JSON.stringify([]));
        console.log("Đã tạo notifications với mảng rỗng.");
    } else {
        console.log("notifications đã tồn tại, không cần tạo mới.");
    }

    try {
        const token = await AsyncStorage.getItem('token');
        if (!token) return;

        const response = await fetch("http://192.168.48.183:5280/api/notification/user/notification", {
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

        // Nếu cả hai mảng đều rỗng, không có thông báo mới
        if (newData.length === 0 && oldNotifications.length === 0) {
            await AsyncStorage.setItem("hasNewNotification", "false");
            return;
        }

        const isSameData = JSON.stringify(newData) === JSON.stringify(oldNotifications);

        if (!isSameData) {
            await AsyncStorage.setItem("notifications", JSON.stringify(newData));
            await AsyncStorage.setItem("hasNewNotification", newData.length > 0 ? "true" : "false");
        } else {
            await AsyncStorage.setItem("hasNewNotification", "false");
        }

    } catch (error) {
        console.error("Error checking notifications:", error);
    }
};


// Hàm bắt đầu kiểm tra thông báo liên tục
export const startNotificationService = () => {
    checkForNewNotifications();
    return setInterval(checkForNewNotifications, 1000); // Kiểm tra mỗi 10 giây
};
