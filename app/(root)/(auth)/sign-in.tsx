import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image , ScrollView} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SignIn = ({ navigation }: any) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const router = useRouter();

    const handleSignIn = async () => {
        const API_URL = "https://a6e2-2401-d800-d560-aa0b-8b3-2fd3-dc84-915c.ngrok-free.app/api/auth/login";

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const responseData = await response.json();

            if (!response.ok) {
                if (response.status === 403) {
                    setErrors({ message: "Your account has been locked." });
                    return;
                }
                if (responseData.message) {
                    setErrors({ message: responseData.message });
                    return;
                }
                
                if (responseData.errors) {
                    const newErrors: { [key: string]: string } = {};
                    if (responseData.errors.Email) {
                        newErrors.email = responseData.errors.Email.join('\n');
                    }
                    if (responseData.errors.Password) {
                        newErrors.password = responseData.errors.Password.join('\n');
                    }
                    if (responseData.errors.message) {
                        newErrors.message = responseData.errors.message.join('\n');
                    }
                    setErrors(newErrors);
                    return;
                }
                throw new Error(responseData.title || "Login failed! Please check your credentials.");
            }
            if (responseData.token) {
                await AsyncStorage.setItem('token', responseData.token);
            }

            await AsyncStorage.setItem('user', JSON.stringify(responseData));

            setMessage({ text: 'Login successful!', type: 'success' });

            setTimeout(() => {
                router.push('/(root)/(tabs)/home');
            }, 2000);
        } catch (error: any) {
            setMessage({ text: '', type: '' });
        }
    };

    return (
        <ScrollView>
        <View style={styles.container}>
            <View style={styles.backgroundContainer}>
                <Text style={styles.welcomeText}>Welcome To </Text>
                <Image 
                    source={require('@/assets/images/signIn.png')} 
                    style={styles.image}
                />
            </View>
            <Text style={styles.logo}>BeautySoft</Text>
            <Text style={styles.title}>Email <Text style ={styles.noticed}>*</Text></Text>
            <TextInput
                style={styles.input}
                placeholder="loan@gmail.com..."
                placeholderTextColor="#C4C4C4"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
            />
            {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}

            <Text style={styles.title}>Password <Text style ={styles.noticed}>*</Text></Text>
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.inputPassword}
                    placeholder="********"
                    placeholderTextColor="#C4C4C4"
                    secureTextEntry={!passwordVisible}
                    value={password}
                    onChangeText={setPassword}
                />
                <TouchableOpacity style={styles.iconEye} onPress={() => setPasswordVisible(!passwordVisible)}>
                    <FontAwesome name={passwordVisible ? "eye" : "eye-slash"} size={20} color="gray" />
                </TouchableOpacity>
            </View>
            {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
            <View style={styles.message}>
                {errors.message && <Text style={styles.errorText}>{errors.message}</Text>}
            </View>
            <TouchableOpacity style={styles.button} onPress={handleSignIn}>
                <Text style={styles.buttonText}>Sign in</Text>
            </TouchableOpacity>
            <View style={styles.forgot}>
                <TouchableOpacity onPress={() => router.push('/(root)/(auth)/sign-up')}>
                    <Text style={styles.link}>Sign up!</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.push('/(root)/(auth)/forgot-password')}>
                    <Text style={styles.link}>Forgot Password!</Text>
                </TouchableOpacity>
            </View>
        </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    iconEye:{
    position: 'absolute',
        right: 10,
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: 'white',
    },
    forgot: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        paddingHorizontal: 20,
    },
    noticed: {
        color: "red"
    },
    backgroundContainer: {
        width: 350,
        height: 250,
        backgroundColor: '#F4F6FF',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        marginBottom: 20,
    },
    welcomeText: {
        fontSize: 32,
        fontFamily: 'PlayfairDisplay-Bold',
        color: '#ED1E51',
        textShadowColor: '#c1a6b3',
        textShadowOffset: { width: 9, height: 3 },
        textShadowRadius: 5,
        marginBottom: 10,
    },
    image: {
        width: '100%',
        height: 184,
        borderRadius: 10,
    },
    logo: {
        fontSize: 60,
        fontFamily: 'PlayfairDisplay-Bold',
        color: '#ED1E51',
        textShadowColor: '#c1a6b3',
        textShadowOffset: { width: 9, height: 3 },
        textShadowRadius: 5,
        width: '100%',
        marginBottom: 10,
    },
    title: {
        fontSize: 18,
        fontWeight: "bold",
        fontFamily: "PlayfairDisplay-Bold",
        color: "black",
        marginBottom: 5,
        alignSelf: "flex-start",
    },
    input: {
        width: '100%',
        padding: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        marginBottom: 10,
        backgroundColor: 'white',
        fontFamily: "PlayfairDisplay-Bold",
        fontSize: 18,
        color: "black"
    },
    inputContainer: {
        position: 'relative',
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
        fontSize: 18,
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
        fontSize: 18,
        fontWeight: 'bold',
    },
    link: {
        marginTop: 20,
        fontSize: 17,
        color: '#007bff',
    },
    message: {
        marginTop: 2,
        fontSize: 18,
        fontWeight: 'bold',
        fontFamily: "PlayfairDisplay-Bold",
    },
    successMessage: {
        color: 'green',
    },
    errorMessage: {
        color: 'red',
        fontSize: 18,
        fontFamily: "PlayfairDisplay-Bold",
        marginBottom: 20,
    },
    errorText: {
        color: 'red',
        fontSize: 18,
        fontFamily: "PlayfairDisplay-Bold",
        marginBottom: 10,
        alignSelf: 'flex-start',
    },
});

export default SignIn;