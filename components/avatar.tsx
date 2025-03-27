import React, { useEffect, useState } from "react";
import { View, Image, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
export default function Avatar() {

    const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [vip, setVip] = useState(true);
  useEffect(() => {
    const fetchUserProfileHome = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (!token) {
          console.error("No token found!");
          setLoading(false);
          return;
        }

        const response = await fetch(
          "http://18.142.0.155:5001/api/users/me",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const responseData = await response.json();
        await AsyncStorage.setItem("user", JSON.stringify(responseData));
        setUser(responseData);
        console.log(responseData);

        const checkVip = await fetch(
          "http://18.142.0.155:5001/api/managerstorage/check-user",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!checkVip.ok) {
          throw new Error("Lỗi khi gọi API");
        }

        const datacheckVip = await checkVip.json();

        setVip(datacheckVip.status);
        if (!response.ok) {
          throw new Error("Failed to fetch user profile");
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfileHome();
  }, []);

    return (
        <View style={styles.headerContainer}>
            <Image
              source={{
                uri: user?.avatar
                  ?  user.avatar
                  : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTzwTARPk--sPXBlUl-Qo4Y2kPpVRdVkTfvQRJh4dwh1bebQ4GP",
              }}
                style={styles.avatar}
            />
        </View>
    );
}


const styles = StyleSheet.create({
    headerContainer: {
        flexDirection: "row",
        justifyContent: "flex-end",
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 25,
        marginLeft: 10
    },
});





