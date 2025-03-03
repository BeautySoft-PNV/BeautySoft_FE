import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';

const Profile = () => {
    const [user, setUser] = useState<any>(null);
    const router = useRouter();
    const [avatar, setAvatar] = useState<string>('');
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

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
                    source={avatar ? { uri: avatar } : require("@/assets/images/banner1.jpg")}
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
                value={user?.username || ''}
                editable={false}
            />
            <Text style={styles.title}>Email*</Text>
            <TextInput
                style={styles.input}
                value={user?.email || ''}
                editable={false}
            />

          <TouchableOpacity style={styles.upgradeButton}>
            <FontAwesome5 name="crown" size={20} color="gold" style={styles.icon} />
            <Text style={styles.buttonText}>Upgrade for experts</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.upgradeButton}>
            <FontAwesome name="diamond" size={20} color="gold" style={styles.icon} />
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
