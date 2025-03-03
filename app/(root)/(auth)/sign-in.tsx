import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const SignIn = ({ navigation }: any) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    const router = useRouter();

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validatePassword = (password: string) => {
        return password.length >= 6; 
    };

    const handleSignIn = async () => {
        if (!validateEmail(email)) {
            setMessage({ text: 'Invalid email format, ex: ex@gmail.com', type: 'error' });
            return;
        }

        if (!validatePassword(password)) {
            setMessage({ text: 'Password must be at least 6 characters long', type: 'error' });
            return;
        }

        const API_URL = "http://localhost:3000/users";
        // const API_URL = "http://192.168.53.183:5280/api/auth/login";
        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, password })
            });
    
            const data = await response.json();
    
            if (!response.ok) {
                throw new Error(data.message || 'Login failed! Invalid email or password.');
            }
            localStorage.setItem('user', JSON.stringify(data));
            setMessage({ text: 'Login successful!', type: 'success' });
    
            setTimeout(() => {
                router.push('/(root)/(tabs)/home');
            }, 2000);
        } catch (error: any) {
            setMessage({ text: error.message, type: 'error' });
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.backgroundContainer}>
                <Text style={styles.welcomeText}>Welcome to BeautySoft</Text>
                <Image 
                    source={require('@/assets/images/signIn.png')} 
                    style={styles.image}
                />
            </View>
            <Text style={styles.logo}>BeautySoft</Text>
            {message.text ? (
                <Text style={[styles.message, message.type === 'success' ? styles.successMessage : styles.errorMessage]}>
                    {message.text}
                </Text>
            ) : null}
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

            <TouchableOpacity style={styles.button} onPress={handleSignIn}>
                <Text style={styles.buttonText}>Sign in</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/(root)/(auth)/sign-up')}>
                <Text style={styles.link}>Do you have not an account, please sign up?</Text>
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
    backgroundContainer: {
        width: 413,
        height: 343,
        backgroundColor: '#F4F6FF',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        marginBottom: 20,
    },
    welcomeText: {
        fontSize: 32,
        fontFamily: 'PlayfairDisplay-Bold',
        color: 'black',
        marginBottom: 10,
    },
    image: {
        width: 341,
        height: 184,
        borderRadius: 10,
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
        backgroundColor: 'white',
        marginBottom: 10, 
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
        marginTop: 20,
        fontSize: 20,
        fontWeight: 'bold',
        fontFamily: "PlayfairDisplay-Bold",
    },
    successMessage: {
        color: 'green',
    },
    errorMessage: {
        color: 'red',
    },
});

export default SignIn;