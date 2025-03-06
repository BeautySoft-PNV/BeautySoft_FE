import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SignUp = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const router = useRouter();

    const handleSignUp = async () => {
        const API_URL = "http://192.168.126.183:5280/api/auth/register";

        try {
            const newErrors: { [key: string]: string } = {};
            if(username.trim() != "" && email.trim() != "" && password.trim()!= "" && confirmPassword.trim() == "" ){
                newErrors.confirmPassword = "confirmPassword is null"
                setErrors(newErrors);
                return
            }
            if(username.trim() != "" && email.trim() != "" && password.trim()!= "" && confirmPassword != password){
                newErrors.confirmPassword = "passwords are not the same"
                setErrors(newErrors);
                return
            }
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
                    if (responseData.errors.Email) {
                        newErrors.email = responseData.errors.Email.join('\n');
                    }
                    if (responseData.errors.Password) {
                        newErrors.password = responseData.errors.Password.join('\n');
                    }
                    if (responseData.errors.Username) {
                        newErrors.username = responseData.errors.Username.join('\n');
                    }

                    setErrors(newErrors);
                    return;
                }
                throw new Error(responseData.message || 'Registration failed');
            }

            if (responseData.token) {
                await AsyncStorage.setItem('token', responseData.token);
            }

            await AsyncStorage.setItem('user', JSON.stringify(responseData));
            router.push('/(root)/(auth)/sign-in');
        } catch (error: any) {
            setErrors({ general: error.message });
        }
    };

    return (
    <ScrollView>
        <View style={styles.container}>
            <Text style={styles.logo}>BeautySoft</Text>

            <Text style={styles.title}>Full Name*</Text>
            <TextInput
                style={styles.input}
                placeholder="Tố Loan..."
                placeholderTextColor="#C4C4C4"
                value={username}
                onChangeText={(text) => {
                    setUsername(text);
                    setErrors((prev) => ({ ...prev, username: '' })); 
                }}
            />
            {errors.username ? <Text style={styles.errorText}>{errors.username}</Text> : null}

            <Text style={styles.title}>Email*</Text>
            <TextInput
                style={styles.input}
                placeholder="loan@gmail.com..."
                placeholderTextColor="#C4C4C4"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={(text) => {
                    setEmail(text);
                    setErrors((prev) => ({ ...prev, email: '' }));
                }}
            />
            {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}

            <Text style={styles.title}>Password*</Text>
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.inputPassword}
                    placeholder="********"
                    placeholderTextColor="#C4C4C4"
                    secureTextEntry={!passwordVisible}
                    value={password}
                    onChangeText={(text) => {
                        setPassword(text);
                        setErrors((prev) => ({ ...prev, password: '' }));
                    }}
                />
                <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)}>
                    <FontAwesome name={passwordVisible ? "eye" : "eye-slash"} size={20} color="gray" />
                </TouchableOpacity>
            </View>
            {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}

            <Text style={styles.title}>Confirm Password*</Text>
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.inputPassword}
                    placeholder="********"
                    placeholderTextColor="#C4C4C4"
                    secureTextEntry={!confirmPasswordVisible}
                    value={confirmPassword}
                    onChangeText={(text) => {
                        setConfirmPassword(text);
                        setErrors((prev) => ({ ...prev, confirmPassword: '' }));
                    }}
                />
                <TouchableOpacity onPress={() => setConfirmPasswordVisible(!confirmPasswordVisible)}>
                    <FontAwesome name={confirmPasswordVisible ? "eye" : "eye-slash"} size={20} color="gray" />
                </TouchableOpacity>
            </View>
            {errors.confirmPassword ? <Text style={styles.errorText}>{errors.confirmPassword}</Text> : null}

            <TouchableOpacity style={styles.button} onPress={handleSignUp}>
                <Text style={styles.buttonText}>Sign up</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push('/(root)/(auth)/sign-in')}>
                <Text style={styles.link}>Already have an account? Log in</Text>
            </TouchableOpacity>
        </View>
    </ScrollView>
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
        color: "black",
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
        color: "black",
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
    errorText: {
        color: 'red',
        fontSize: 14,
        alignSelf: 'flex-start',
        marginBottom: 10,
    },
});

export default SignUp;
