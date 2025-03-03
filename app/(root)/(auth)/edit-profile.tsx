import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const EditProfile = () => {
    const [user, setUser] = useState<any>(null);
    const [avatar, setAvatar] = useState<string>('');
    const [username, setUsername] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            setAvatar(parsedUser.avatar || '');
            setUsername(parsedUser.username || '');
            setEmail(parsedUser.email || '');
            setPassword(parsedUser.password || '');
            setConfirmPassword(parsedUser.confirmPassword || '');
        }
    }, []);
    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission required', 'Bạn cần cấp quyền để truy cập thư viện ảnh.');
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled) {
            setAvatar(result.assets[0].uri);
        }
    };
    const handleUpdateProfile = async () => {
        if (!username || !email || !password || !confirmPassword) {
            Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin!');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp!');
            return;
        }

        const updatedUser = {
            ...user,
            username,
            email,
            password,
            confirmPassword,
            avatar,
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));

        Alert.alert('Thành công', 'Thông tin đã được cập nhật!');
        router.push('/(root)/(auth)/profile');
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
                <Image
                    source={avatar ? { uri: avatar } : require("@/assets/images/banner1.jpg")}
                    style={styles.avatar}
                />
                <TouchableOpacity style={styles.editIcon} onPress={pickImage}>
                    <FontAwesome5 name="camera" size={18} color="#ED1E51" />
                </TouchableOpacity>
            </View>
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
                    value={password}
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
    header: { fontSize: 24, fontWeight: 'bold', color: 'black', marginLeft: 100 },
    avatarContainer: { justifyContent: "center", alignItems: "center", marginBottom: 20, position: "relative" },
    editIcon: { position: "absolute", borderRadius: 20, width: 30, height: 30, justifyContent: "center", alignItems: "center", marginLeft: 90, bottom: -15 },
    avatar: { width: 100, height: 100, borderRadius: 50 },
    title: { fontSize: 20,fontWeight: "bold",fontFamily: "PlayfairDisplay-Bold", color: "black", marginBottom: 5, alignSelf: "flex-start" },
    input: {fontSize: 20,fontWeight: "bold",fontFamily: "PlayfairDisplay-Bold", width: '100%', padding: 10, borderWidth: 1, borderColor: '#ccc', borderRadius: 5, backgroundColor: 'white', color: "black", marginBottom: 10 },
    inputContainer: {fontSize: 20,fontWeight: "bold",fontFamily: "PlayfairDisplay-Bold",flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#ccc', borderRadius: 5, backgroundColor: 'white', paddingHorizontal: 10, marginBottom: 10 },
    inputPassword: { fontSize: 20,fontWeight: "bold",fontFamily: "PlayfairDisplay-Bold",flex: 1, padding: 10},
    button: { backgroundColor: "#ED1E51", padding: 15, borderRadius: 5, alignItems: "center", marginTop: 20 },
    buttonText: { fontSize: 20,fontWeight: "bold",fontFamily: "PlayfairDisplay-Bold", color: "white" },
});

export default EditProfile;
