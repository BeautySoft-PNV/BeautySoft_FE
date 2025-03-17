import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AntDesign, FontAwesome5 } from "@expo/vector-icons";
import { FontAwesome } from "@expo/vector-icons";
import moment from "moment";

interface ItemData {
  id: string,
  name: string, 
  description: string,
  guidance: string,
  image: string,
  dateOfManuaFacture: string,
  expirationDate: string
}

const ItemDetail = () => {
  const { id } = useLocalSearchParams();
  const [itemData, setItemData] = useState <ItemData | null> (null);
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
          "http://192.168.48.183:5280/api/users/me",
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
          "http://192.168.48.183:5280/api/managerstorage/check-user",
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

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      const getToken = async () => {
          try {
            if (Platform.OS === "web") {
              return localStorage.getItem("token") || "";
            } else {
              return (await AsyncStorage.getItem("token")) || "";
            }
          } catch (error) {
            console.error("Lỗi lấy token:", error);
            return "";
          }
        };
        const token = await getToken();
        if (!token) throw new Error("No authentication token found");

      try {
        

        const response = await fetch(
          `http://192.168.11.183:5280/api/MakeupItems/${id}`,
          {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!response.ok)
          throw new Error(`HTTP error! Status: ${response.status}`);

        const data = await response.json();
        setItemData(data);
        console.log("data: ", data)
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);


  return (
    <SafeAreaView style={styles.safeContainer}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.avatarContainer}>
          <TouchableOpacity
            onPress={() => router.push("/(root)/(auth)/profile")}
          >
            <Image
              source={{
                uri: user?.avatar
                  ? "http://192.168.48.183:5280" + user.avatar
                  : "https://photo.znews.vn/w660/Uploaded/kbd_pilk/2021_05_06/trieu_le_dinh4.jpg",
              }}
              style={styles.avatar}
            />
          </TouchableOpacity>
          {vip && (
            <FontAwesome5
              name="crown"
              size={20}
              color="gold"
              style={styles.crownIcon}
            />
          )}
        </View>
      </ScrollView>
      <Text style={styles.title}>Item storage</Text>

      <ScrollView>
        <View style={styles.containerItemDetail}>
        <Text style={styles.title}>{itemData?.name}</Text>
        <View style={styles.timeContainer}>
          <FontAwesome name="calendar" size={14} color="black" />
          <Text style={styles.time}>
            {moment(itemData?.expirationDate).format("DD/MM/YYYY hh:mm A")}
          </Text>
        </View> 
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {backgroundColor: "#F3F4F6" },
  scrollContainer: {
    paddingHorizontal: 16,
    display: "flex",
    alignItems: "flex-end",
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginVertical: 10,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    // marginBottom: 50,
    marginTop: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "black",
    justifyContent: "center", // Đẩy hai phần tử ra hai đầu
    alignItems: "center", // Căn giữa theo trục dọc
  },

  container: {
    flexDirection: "row", // Căn theo chiều ngang
    justifyContent: "space-between", // Đẩy hai phần tử ra hai đầu
    alignItems: "center", // Căn giữa theo trục dọc
    paddingHorizontal: 1, // Khoảng cách hai bên
    marginTop: 20,
  },
  avatarContainer: {
    position: "relative",
    right: 0,
  },
  crownIcon: {
    position: "absolute",
    top: 3,
    left: -10,
    transform: [{ rotate: "-50deg" }],
  },
  containerItemDetail: {
    paddingHorizontal: 30, // Khoảng cách hai bên
    marginBottom: 30,
  },

  imageItem: {
    width: "100%",
    height: "100%",
    borderRadius: 16,
  },
  textItem: {
    marginTop: 10,
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  time: {
    color: "black",
    fontFamily: "PlayfairDisplay-Medium",
    fontWeight: "bold",
  },
});

export default ItemDetail;
