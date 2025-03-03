import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SignUp = ({ navigation }: any) => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    const router = useRouter();

    const handleSignUp = async () => {
        const API_URL = "http://192.168.99.183:5280/api/auth/register";
    
        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username,
                    email,
                    password,
                    roleId: 1,
                }),
            });
            const responseData = await response.json();
            if (!response.ok) {
                if (responseData.errors) {
                    const errorMessages = Object.values(responseData.errors)
                        .flat()
                        .join('\n');
    
                    throw new Error(errorMessages);
                }
                throw new Error(responseData.message || 'Registration failed');
            }
            if (responseData.token) {
                await AsyncStorage.setItem('token', responseData.token);
            }
    
            await AsyncStorage.setItem('user', JSON.stringify(responseData));
            setMessage({ text: 'Account created successfully! Redirecting to Sign In...', type: 'success' });
    
            setTimeout(() => {
                router.push('/(root)/(auth)/sign-in');
            }, 2000);
        } catch (error: any) {
            setMessage({ text: error.message, type: 'error' });
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.logo}>BeautySoft</Text>
            {message.text ? (
                <Text style={[styles.message, message.type === 'success' ? styles.successMessage : styles.errorMessage]}>
                    {message.text}
                </Text>
            ) : null}
            <Text style={styles.title}>Full Name*</Text>
            <TextInput
                style={styles.input}
                placeholder="Tố Loan..."
                placeholderTextColor="#C4C4C4"
                value={username}
                onChangeText={setUsername}
            />

            <Text style={styles.title}>Email*</Text>
            <TextInput
                style={styles.input}
                placeholder="loan@gmail.com..."
                placeholderTextColor="#C4C4C4"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
            />

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

            <TouchableOpacity style={styles.button} onPress={handleSignUp}>
                <Text style={styles.buttonText}>Sign up</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push('/(root)/(auth)/sign-in')}>
                <Text style={styles.link}>Already have an account? Log in</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: 'white',
    },
    logo: {
        fontSize: 60,
        fontFamily: 'PlayfairDisplay-Bold',
        color: '#ED1E51',
        marginBottom: 50,
        textShadowColor: '#c1a6b3',
        textShadowOffset: { width: 9, height: 3 },
        textShadowRadius: 5,
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        fontFamily: "PlayfairDisplay-Bold",
        color: "black",
        marginBottom: 5,
        alignSelf: "flex-start",
    },
    input: {
        width: '100%',
        padding: 15,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        marginBottom: 10,
        backgroundColor: 'white',
        fontFamily: "PlayfairDisplay-Bold",
        fontSize: 20,
        color: "black"
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        paddingHorizontal: 10,
        backgroundColor: 'white',
        marginBottom: 10,
        padding: 7,
    },
    inputPassword: {
        flex: 1,
        paddingVertical: 10,
        fontFamily: "PlayfairDisplay-Bold",
        fontSize: 20,
        color: "black"
    },
    button: {
        backgroundColor: '#e91e63',
        padding: 10,
        borderRadius: 5,
        width: '100%',
        alignItems: 'center',
        marginTop: 12,
    },
    buttonText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    link: {
        marginTop: 20,
        fontSize: 20,
        color: '#007bff',
    },
    message: {
        marginTop: 10,
        fontSize: 20,
        fontWeight: 'bold',
        fontFamily: "PlayfairDisplay-Bold",
    },
    successMessage: {
        color: 'green',
        fontSize: 20,
        fontFamily: "PlayfairDisplay-Bold",
    },
    errorMessage: {
        color: 'red',
        fontSize: 15,
        fontFamily: "PlayfairDisplay-Bold",
        marginBottom: 4    },
});

export default SignUp;