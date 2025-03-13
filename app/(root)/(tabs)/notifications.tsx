import React, { useState, useEffect, useCallback  } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { router, useNavigation } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from '@react-navigation/native';

const Notifications = () => {
    const [notifications, setNotifications] = useState<Array<{id: number; notificationId: number; description: string; date: string ; title: string}>>([]);
    const navigation = useNavigation();
    const [unreadCount, setUnreadCount] = useState(0);

    const deleteNotification = async (notificationId: number) => {
        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                console.error("No token found!");
                return;
            }

            const response = await fetch(`http://192.168.11.183:5280/api/notification/user/notification/${notificationId}`, {
                method: "DELETE",
                headers: {
                    'Content-Type': 'application/json',
                    "Authorization": `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error("Failed to delete notification");
            }

            setNotifications(notifications.filter(n => n.id !== notificationId));
        } catch (error) {
            console.error("Error deleting notification:", error);
        }
    };

    useEffect(() => {
        navigation.setOptions({ headerShown: false });
    }, [navigation]);

    const fetchNotifications = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                console.error("No token found!");
                return;
            }

            const response = await fetch("http://192.168.11.183:5280/api/notification/user/notification", {
                method: "GET",
                headers: {
                    'Content-Type': 'application/json',
                    "Authorization": `Bearer ${token}`
                }
            });
            const data = await response.json();
            setNotifications(data);
        } catch (error) {
            console.error("Error fetching notifications:", error);
        }
    };

    const markNotificationsAsRead = async () => {
        await AsyncStorage.setItem('hasNewNotification', 'false');
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
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    return (
        <ScrollView style={styles.scrollView}>
            <View style={styles.container}>
                <View style={styles.headerContainer}>
                    <TouchableOpacity onPress={() => router.push('/(root)/(tabs)/home')}>
                        <FontAwesome name="chevron-left" size={24} color="#ED1E51" />
                    </TouchableOpacity>
                    <Text style={styles.header}>Notification</Text>
                </View>
                {notifications.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <FontAwesome name="check-circle" size={50} color="green" />
                        <Text style={styles.emptyText}>You have seen all the notifications</Text>
                    </View>
                ) : (
                    notifications.map((item) => (
                        <View key={item.id} style={styles.card}>
                            <TouchableOpacity onPress={() => deleteNotification(item.notificationId)} style={styles.closeButton}>
                                <FontAwesome name="times" size={18} color="white" />
                            </TouchableOpacity>
                            <Text style={styles.cardTitle}>{item.title}</Text>
                            <View style={styles.cardContent}>
                                <Text style={styles.cardText}>{item.description}</Text>
                            </View>
                            <Text style={styles.cardDate}>{formatDate(item.date)}</Text>
                        </View>
                    ))
                )}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    closeButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        padding: 5,
        borderRadius: 12,
    },
    scrollView: {
        flex: 1,
        backgroundColor: 'white',
        width: '100%',
    },
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
        padding: 8,
        marginTop: 20,
    },
    headerContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        width: '100%',
        marginBottom: 40,
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'black',
        fontFamily: "PlayfairDisplay-Bold",
        marginRight: "30%"
    },
    card: {
        backgroundColor: '#ED1E51',
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        padding: 16,
        marginBottom: 20,
        width: '95%',
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 8,
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    cardText: {
        color: 'white',
        fontSize: 18,
        width: '100%',
    },
    cardDate: {
        fontSize: 14,
        color: 'white',
        marginTop: 10,
        fontStyle: 'italic',
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 50,
    },
    emptyText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'black',
        marginTop: 10,
    }
});

export default Notifications;
