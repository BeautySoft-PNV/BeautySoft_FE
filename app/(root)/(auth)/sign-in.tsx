import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const SignIn = ({ navigation }: any) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordVisible, setPasswordVisible] = useState(false);
    const router = useRouter();

    const handleSignIn = async () => {
        const API_URL = "http://192.168.68.131:5280/api/auth/login";

        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email,
                    password,
                }),
            });

            if (!response.ok) {
                throw new Error('Đăng nhập thất bại!');
            }

            const data = await response.json();
            Alert.alert('Đăng nhập thành công');
            navigation.navigate('Home');
        } catch (error: any) {
            Alert.alert('Lỗi', error.message);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.logo}>BeautySoft</Text>
            <TextInput
                style={styles.input}
                placeholder="Email"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
            />
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.inputPassword}
                    placeholder="Mật khẩu"
                    secureTextEntry={!passwordVisible}
                    value={password}
                    onChangeText={setPassword}
                />
                <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)}>
                    <FontAwesome name={passwordVisible ? "eye" : "eye-slash"} size={20} color="gray" />
                </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.button} onPress={handleSignIn}>
                <Text style={styles.buttonText}>Đăng nhập</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/(root)/(auth)/sign-up')}>
                <Text style={styles.link}>Đã có tài khoản? Đăng nhập</Text>
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
        fontSize: 45,
        fontFamily: 'Pacifico',
        color: '#e91e63',
        marginBottom: 50,
    },
    input: {
        width: '100%',
        padding: 15,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        marginBottom: 10,
        backgroundColor: 'white',
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
        color: '#007bff',
    },
});

export default SignIn;
