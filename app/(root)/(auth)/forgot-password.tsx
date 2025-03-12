import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ForgotPasswordScreen = () => {
    const [email, setEmail] = useState('');
    const [timer, setTimer] = useState(0);

    useEffect(() => {
        const checkTime = async () => {
            const storedTime = await AsyncStorage.getItem('time');
            if (storedTime) {
                const diff = 60 - Math.floor((Date.now() - parseInt(storedTime)) / 1000);
                if (diff > 0) {
                    setTimer(diff);
                } else {
                    await AsyncStorage.removeItem('time');
                }
            }
        };
        checkTime();
    }, []);

    useEffect(() => {
        let interval : NodeJS.Timeout;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => {
                    if (prev <= 1) {
                        AsyncStorage.removeItem('time');
                        clearInterval(interval);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

    const handleForgotPassword = async () => {
        if (!email) {
            Alert.alert("Error", "Please enter email");
            return;
        }

        try {
            const response = await fetch("http://192.168.48.183:5280/api/account/forgot-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (response.ok) {
                Alert.alert("Success", data.message);
                const now = Date.now();
                await AsyncStorage.setItem('time', now.toString());
                setTimer(60);
            } else {
                Alert.alert("Error", "An error occurred. Please try again!");
            }
        } catch (error) {
            Alert.alert("Connection error", "Check the server again.");
            console.error(error);
        }
    };

    return (
        <ScrollView> 
        <View style={styles.container}>
            <Text style={styles.title}>Forgot Password</Text>
            <Text style={styles.description}>
                Enter your email to receive password reset instructions.
            </Text>
            <TextInput
                style={styles.input}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
            />
            <TouchableOpacity
                style={[styles.button, timer > 0 && { backgroundColor: '#ccc' }]}
                onPress={handleForgotPassword}
                disabled={timer > 0}
            >
                <Text style={styles.buttonText}>
                    {timer > 0 ? `Send back later ${timer}s` : "Submit request"}
                </Text>
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
        backgroundColor: '#f9f9f9',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    description: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 20,
        color: '#666',
    },
    input: {
        width: '100%',
        height: 50,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 10,
        backgroundColor: '#fff',
        marginBottom: 20,
    },
    button: {
        backgroundColor: '#007bff',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        width: '100%',
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default ForgotPasswordScreen;
