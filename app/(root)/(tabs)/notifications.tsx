import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { router, useNavigation } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";

const Notifications = () => {
  const [notifications, setNotifications] = useState<
    Array<{
      id: number;
      notificationId: number;
      description: string;
      date: string;
      title: string;
    }>
  >([]);
  const navigation = useNavigation();
  const [unreadCount, setUnreadCount] = useState(0);

  const deleteNotification = async (notificationId: number) => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        console.error("No token found!");
        return;
      }

      const response = await fetch(
        `http://192.168.68.102:5280/api/notification/user/notification/${notificationId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete notification");
      }
      setNotifications((prevNotifications) => prevNotifications.filter(n => n.notificationId !== notificationId));
      fetchNotifications();
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const fetchNotifications = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        console.error("No token found!");
        return;
      }

      const response = await fetch(
        "http://192.168.68.102:5280/api/notification/user/notification",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      setNotifications(data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const markNotificationsAsRead = async () => {
    await AsyncStorage.setItem("hasNewNotification", "false");
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  useFocusEffect(
    useCallback(() => {
      markNotificationsAsRead();
    }, [])
  );

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => router.push("/(root)/(tabs)/home")}>
            <FontAwesome name="chevron-left" size={24} color="#ED1E51" />
          </TouchableOpacity>
          <Text style={styles.header}>Notification</Text>
        </View>
        {notifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <FontAwesome name="check-circle" size={50} color="green" />
            <Text style={styles.emptyText}>
              You have seen all the notifications
            </Text>
          </View>
        ) : (
          notifications.map((item) => (
            <View key={item.id} style={styles.card}>
              <View style={styles.cardContentContainer}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <View style={styles.cardContent}>
                  <Text style={styles.cardText}>{item.description}</Text>
                </View>
                <Text style={styles.cardDate}>{formatDate(item.date)}</Text>
              </View>

              <TouchableOpacity
                onPress={() => deleteNotification(item.id)}
                style={styles.closeButton}
              >
                <FontAwesome name="times" size={18} color="#ED1E51" />
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
};

const { height } = Dimensions.get("window");

const styles = StyleSheet.create({
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    padding: 7,
    borderRadius: 50,
  },
  scrollView: {
    flex: 1,
    backgroundColor: "white",
    width: "100%",
    height: height, 
    fontFamily: "PlayfairDisplay-Bold",
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    padding: 8,
    marginTop: 20,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 40,
  },
  header: {
    fontSize: 24,
    color: "#ED1E51",
    fontFamily: "PlayfairDisplay-Bold",
    marginRight: "30%",
  },
  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 12,
    backgroundColor: "#FFE2E2",
    borderRadius: 8,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  cardContentContainer: {
    flex: 1,
    marginRight: 20,
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: "PlayfairDisplay-Bold",
    color: "black",
    marginBottom: 4,
  },
  cardContent: {
    marginBottom: 6,
  },
  cardText: {
    color: "#333",
    fontSize: 16,
    fontFamily: "PlayfairDisplay-Medium",
  },
  cardDate: {
    fontSize: 12,
    color: "#666",
    marginTop: 10,
    fontFamily: "PlayfairDisplay-Italic",
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: 50,
  },
  emptyText: {
    fontSize: 20,
    fontFamily: "PlayfairDisplay-Bold",
    color: "black",
    marginTop: 10,
  },
});

export default Notifications;
