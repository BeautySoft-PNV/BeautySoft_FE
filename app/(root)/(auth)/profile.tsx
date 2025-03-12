import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator } from 'react-native';

const Profile = () => {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const [vip, setVip] = useState(true);
    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const token = await AsyncStorage.getItem('token');
                if (!token) {
                    console.error("No token found!");
                    setLoading(false);
                    return;
                }

                const response = await fetch("http://192.168.48.183:5280/api/users/me", {
                    method: "GET",
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch user profile");
                }

                const responseData = await response.json();
                await AsyncStorage.setItem('user', JSON.stringify(responseData));
                setUser(responseData);

                const checkVip = await fetch("http://192.168.48.183:5280/api/managerstorage/check-user", {
                    method: "GET",
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (!checkVip.ok) {
                    throw new Error("Lỗi khi gọi API");
                }

                const datacheckVip = await checkVip.json();

                setVip(datacheckVip.status);
            } catch (error) {
                console.error("Error fetching profile:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, []);

    if (loading) {
        return <ActivityIndicator size="large" color="#0000ff" />;
    }

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <TouchableOpacity onPress={() => router.push('/(root)/(tabs)/home')}>
                    <FontAwesome name="chevron-left" size={24} color="#ED1E51" />
                </TouchableOpacity>
                <Text style={styles.header}>My Account</Text>
            </View>
            <View style={styles.avatarContainer}>
                <Image
                    source={{
                        uri: user.avatar
                            ? "http://192.168.48.183:5280" + user.avatar
                            : "https://photo.znews.vn/w660/Uploaded/kbd_pilk/2021_05_06/trieu_le_dinh4.jpg"
                    }}
                    style={styles.avatar}
                />
                <TouchableOpacity
                    style={styles.editIcon}
                    onPress={() => router.push('/(root)/(auth)/edit-profile')}
                >
                      <FontAwesome name="pencil" size={18} color="#ED1E51" />
                </TouchableOpacity>
            </View>
            <Text style={styles.title}>Full Name*</Text>
            <TextInput
                style={styles.input}
                value={user?.name || ''}
                editable={false}
            />
            <Text style={styles.title}>Email*</Text>
            <TextInput
                style={styles.input}
                value={user?.email || ''}
                editable={false}
            />

            <TouchableOpacity
                style={[styles.upgradeButton, vip && styles.disabledButton]}
                onPress={() => router.push('/(root)/tabs/unlimited-storage')}
                disabled={vip}
            >
                <FontAwesome5 name="crown" size={20} color="gold" style={styles.icon} />
                <Text style={styles.buttonText}>Get Unlimited Access</Text>
            </TouchableOpacity>

        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: 'white' },
    headerContainer: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
    header: { fontSize: 24, fontWeight: 'bold', color: 'black', marginLeft: 100, fontFamily: "PlayfairDisplay-Bold" },
    avatarContainer: { justifyContent: "center", alignItems: "center", marginBottom: 20, position: "relative" },
    editIcon: { position: "absolute", borderRadius: 20, width: 30, height: 30, justifyContent: "center", alignItems: "center", marginLeft: 90, bottom: -15 },
    avatar: { width: 90, height: 90, borderRadius: 50 },
    title: { fontSize: 20, fontWeight: "bold", fontFamily: "PlayfairDisplay-Bold", color: "black", marginBottom: 5, alignSelf: "flex-start" },
    input: { width: '100%', padding: 15, borderWidth: 1, borderColor: '#ccc', borderRadius: 5, backgroundColor: 'white', color: "black", marginBottom: 10 , fontSize: 20, fontWeight: "bold", fontFamily: "PlayfairDisplay-Bold",},
              upgradeButton: {
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#ED1E51",
            paddingVertical: 12,
            paddingHorizontal: 20,
            borderRadius: 15,
            marginVertical: 10,
            justifyContent: "center",
            width: "100%",
            fontSize: 20,
            fontWeight: "bold",
            fontFamily: "PlayfairDisplay-Bold",
        },
    disabledButton: {
        opacity: 0.5,
    },
        icon: {
            marginRight: 30,
        },
        buttonText: {
          fontSize: 20,
          fontWeight: "bold",
          fontFamily: "PlayfairDisplay-Bold",
          color: "white",
        },

});

export default Profile;
