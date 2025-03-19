import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const ForgotPasswordScreen = () => {
    const [email, setEmail] = useState('');
    const [timer, setTimer] = useState(0);
    const navigation = useNavigation();


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
            const response = await fetch("http://192.168.31.183:5280/api/account/forgot-password", {
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
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
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
    backButton: {
        alignSelf: 'flex-start',
        marginBottom: 20,
    },
    backButtonText: {
        fontSize: 18,
        color: '#007bff',
        fontFamily: "PlayfairDisplay-Bold",

    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#f9f9f9',
    },
    title: {
        fontSize: 24,
        marginBottom: 10,
        fontFamily: "PlayfairDisplay-Bold",
        color: "#ED1E51"
    },
    description: {
        fontSize: 15,
        textAlign: 'center',
        marginBottom: 20,
        color: '#666',
        fontFamily: "PlayfairDisplay-Bold",
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
        fontSize: 18, 
        fontFamily: "PlayfairDisplay-Bold",
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
        fontFamily: "PlayfairDisplay-Bold",
    },
});

export default ForgotPasswordScreen;
