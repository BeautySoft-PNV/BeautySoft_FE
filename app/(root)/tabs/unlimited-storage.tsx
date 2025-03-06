import React, {useEffect, useState} from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Linking } from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";

const router = useRouter();

const UpgradeStorage = () => {
  const [user, setUser] = useState<any>(null);
  const [typeStorage, setTypeStorage] = useState<any>(null);
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          console.error("No token found!");
          return;
        }

        const response = await fetch("http://192.168.126.183:5280/api/users/me", {
          method: "GET",
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error("Failed to fetch user profile");
        }

        const responseData = await response.json();
        await AsyncStorage.setItem('user', JSON.stringify(responseData));
        setUser(responseData);

        const responseTypeStorage = await fetch("http://192.168.126.183:5280/api/TypeStorage/1", {
          method: "GET",
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (!responseTypeStorage.ok) {
          throw new Error("Failed to fetch user profile");
        }

        const responseDataTypeStorage = await responseTypeStorage.json();
        await AsyncStorage.setItem('typeStorage', JSON.stringify(responseDataTypeStorage));
        setTypeStorage(responseDataTypeStorage);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUser();
  }, []);


  const handlePayment = async () => {
    try {
      const response = await fetch('http://192.168.126.183:5280/api/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          Name: user?.name,
          Amount: typeStorage?.price,
          OrderDescription: 'Thanh toán qua vnpay',
          OrderType: 'other',
          returnUrl:`http://192.168.126.183:5280/api/payment/confirm?userId=${user?.id}&typeStorageId=${typeStorage?.id}`,
        }),
      });

      const data = await response.json();
      if (response.ok && data.paymentUrl) {
        Linking.openURL(data.paymentUrl);
      } else {
        Alert.alert('Lỗi: Không lấy được URL thanh toán.');
      }
    } catch (error) {
      Alert.alert('Lỗi: Không thể kết nối đến máy chủ.');
    }
  };

  return (
      <ScrollView style={styles.container}>
        <View style={styles.card}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.push('/(root)/(auth)/profile')}>
              <FontAwesome name="chevron-left" size={24} color="#ED1E51" />
            </TouchableOpacity>
            <Text style={styles.title}>Makeup Artist Upgrade</Text>
          </View>
          <Image
              source={{ uri: 'https://jibitoo.com/wp-content/uploads/2025/01/%D8%AA%D8%B1%D9%81%D9%86%D8%AF%D9%87%D8%A7%DB%8C-%D8%A2%D8%B1%D8%A7%DB%8C%D8%B4%DB%8C.jpg' }}
              style={styles.image}
              resizeMode="cover"
          />
          <View style={styles.infoContainer}>
            <Text style={styles.subtitle}>💄 {typeStorage?.name} 💄</Text>
            <Text style={styles.price}>{typeStorage?.price} VND / Permanent package</Text>
            <View style={styles.bulletPoints}>
              <Text style={styles.textPoints}>✨ 1. Upgrade your makeup storage item</Text>
              <Text style={styles.textPoints}>✨ 2.  Upgrade your makeup storage style</Text>
              <Text style={styles.textPoints}>✨ 3. Favorite repository and 24/7 support</Text>
            </View>
            <Text style={styles.description}>💄 {typeStorage?.description}</Text>
            <Text style={styles.contact}>📞 Contact us today for a detailed consultation!</Text>
          </View>
          <TouchableOpacity style={styles.upgradeButton} onPress={handlePayment}>
            <Text style={styles.upgradeButtonText}>Upgrade now</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
  );
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      height:"100%"
    },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    padding: 20,
    width: '100%',
    height: 'auto',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    marginRight: 10,
  },
  backButtonText: {
    color: '#ED1E51',
    fontSize: 20,
    fontWeight: "bold",
    fontFamily: "PlayfairDisplay-Bold"
  },
  title: {
    color: '#ED1E51',
    fontSize: 24,
    fontWeight: "bold",
    fontFamily: "PlayfairDisplay-Bold",
    textAlign: 'center',
  },
  image: {
    borderRadius: 10,
    height: 200,
    width: '100%',
    marginBottom: 20,
  },
  infoContainer: {
    backgroundColor: '#edf2f7',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: "bold",
    fontFamily: "PlayfairDisplay-Bold",
    marginBottom: 10,
  },
  price: {
    textAlign: 'center',
    color: '#ED1E51',
    fontSize: 20,
    fontWeight: "bold",
    fontFamily: "PlayfairDisplay-Bold",
    marginBottom: 10,
  },
  bulletPoints: {
    marginBottom: 10,
    fontSize: 20,
    fontWeight: "bold",
    fontFamily: "PlayfairDisplay-Bold"
  },
  description: {
    textAlign: 'center',
    marginBottom: 10,
    fontSize: 20,
    fontWeight: "bold",
    fontFamily: "PlayfairDisplay-Bold"
  },
  contact: {
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 20,
    fontWeight: "bold",
    fontFamily: "PlayfairDisplay-Bold"
  },
  upgradeButton: {
    backgroundColor: '#ED1E51',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    fontSize: 20,
    fontWeight: "bold",
    fontFamily: "PlayfairDisplay-Bold"
  },
  upgradeButtonText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: "bold",
    fontFamily: "PlayfairDisplay-Bold"
  },
  textPoints: {
    fontSize: 20,
    fontWeight: "bold",
    fontFamily: "PlayfairDisplay-Bold"
  }

});


export default UpgradeStorage;