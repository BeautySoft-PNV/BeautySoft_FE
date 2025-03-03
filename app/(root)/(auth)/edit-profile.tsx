import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const EditProfile = () => {
    const [user, setUser ] = useState<any>(null);
    const [avatar, setAvatar] = useState<string>('');
    const [username, setUsername] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
    const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' }>({ text: '', type: 'error' });
    
    const router = useRouter();

    useEffect(() => {
        const loadUserData = async () => {
            try {
                const storedUser  = await AsyncStorage.getItem('user');
                if (storedUser ) {
                    const parsedUser  = JSON.parse(storedUser );
                    setUser (parsedUser );
                    setAvatar(parsedUser .avatar || '');
                    setUsername(parsedUser .username || '');
                    setEmail(parsedUser .email || '');
                    setPassword(parsedUser .password || '');
                    setConfirmPassword(parsedUser .password || '');
                }
            } catch (error) {
                console.error("Error loading user data:", error);
            }
        };
        loadUserData();
    }, []);

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            setMessage({ text: 'Permission required to access the image library.', type: 'error' });
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            setAvatar(result.assets[0].uri);
        }
    };

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validatePassword = (password: string) => {
        return password.length >= 6;
    };

    const handleUpdateProfile = async () => {
        setMessage({ text: '', type: 'error' });

        if (!validateEmail(email)) {
            setMessage({ text: 'Invalid email format, ex: ex@gmail.com', type: 'error' });
            return;
        }

        if (!validatePassword(password)) {
            setMessage({ text: 'Password must be at least 6 characters long', type: 'error' });
            return;
        }

        if (password !== confirmPassword) {
            setMessage({ text: 'Passwords do not match', type: 'error' });
            return;
        }

        const updatedUser  = {
            ...user,
            username,
            email,
            password,
            avatar,
        };

        try {
            await AsyncStorage.setItem('user', JSON.stringify(updatedUser ));
            setMessage({ text: 'Profile updated successfully!', type: 'success' });
            router.push('/(root)/(auth)/profile');
        } catch (error) {
            console.error("Error updating data:", error);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <TouchableOpacity onPress={() => router.push('/(root)/(auth)/profile')}>
                    <FontAwesome name="chevron-left" size={24} color="#ED1E51" />
                </TouchableOpacity>
                <Text style={styles.header}>My Account</Text>
            </View>
            <View style={styles.avatarContainer}>
                <Image source={{ uri: avatar || "https://cdn-icons-png.flaticon.com/512/149/149071.png" }} style={styles.avatar} />
                <TouchableOpacity style={styles.editIcon} onPress={pickImage}>
                    <FontAwesome5 name="camera" size={18} color="#ED1E51" />
                </TouchableOpacity>
            </View>
            {message.text ? (
                <Text style={[styles.message, message.type === 'success' ? styles.successMessage : styles.errorMessage]}>
                    {message.text}
                </Text>
            ) : null}
            <Text style={styles.title}>Full Name*</Text>
            <TextInput style={styles.input} value={username} onChangeText={setUsername} />

            <Text style={styles.title}>Email*</Text>
            <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" />

            <Text style={styles.title}>Password*</Text>
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.inputPassword}
                    placeholder="********"
                    placeholderTextColor="#C4C4C4"
                    secureTextEntry={!passwordVisible}
                    value={password}
                    onChangeText={setPassword}
                />
                <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)}>
                    <FontAwesome name={passwordVisible ? "eye" : "eye-slash"} size={20} color="gray" />
                </TouchableOpacity>
            </View>

            <Text style={styles.title}>Confirm Password*</Text>
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.inputPassword}
                    placeholder="********"
                    placeholderTextColor="#C4C4C4"
                    secureTextEntry={!confirmPasswordVisible}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                />
                <TouchableOpacity onPress={() => setConfirmPasswordVisible(!confirmPasswordVisible)}>
                    <FontAwesome name={confirmPasswordVisible ? "eye" : "eye-slash"} size={20} color="gray" />
                </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.button} onPress={handleUpdateProfile}>
                <Text style={styles.buttonText}>Update</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: 'white' },
    headerContainer: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
    header: { color: 'black', marginLeft: 100, fontSize: 24, fontWeight: "bold", fontFamily: "PlayfairDisplay-Bold" },
    avatarContainer: { justifyContent: "center", alignItems: "center", marginBottom: 20, position: "relative" },
    editIcon: { position: "absolute", borderRadius: 20, width: 30, height: 30, justifyContent: "center", alignItems: "center", marginLeft: 90, bottom: -15 },
    avatar: { width: 90, height: 90, borderRadius: 50 },
    title: { fontSize: 20, fontWeight: "bold", fontFamily: "PlayfairDisplay-Bold", color: "black", marginBottom: 5, alignSelf: "flex-start" },
    input: { fontSize: 20, fontWeight: "bold", fontFamily: "PlayfairDisplay-Bold", width: '100%', padding: 10, borderWidth: 1, borderColor: '#ccc', borderRadius: 5, backgroundColor: 'white', color: "black", marginBottom: 10 },
    inputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#ccc', borderRadius: 5, backgroundColor: 'white', paddingHorizontal: 10, marginBottom: 10 },
    inputPassword: { fontSize: 20, fontWeight: "bold", fontFamily: "PlayfairDisplay-Bold", flex: 1, padding: 10 },
    button: { backgroundColor: "#ED1E51", padding: 15, borderRadius: 5, alignItems: "center", marginTop: 20 },
    buttonText: { fontSize: 20, fontWeight: "bold", fontFamily: "PlayfairDisplay-Bold", color: "white" },
    message: {
        marginTop: 20,
        fontSize: 20,
        fontWeight: 'bold',
        fontFamily: "PlayfairDisplay-Bold",
        marginBottom:20
    },
    successMessage: {
        color: 'green',
        fontSize: 20,
        fontFamily: "PlayfairDisplay-Bold",
    },
    errorMessage: {
        color: 'red',
        fontSize: 20,
        fontFamily: "PlayfairDisplay-Bold",
    },
});

export default EditProfile;