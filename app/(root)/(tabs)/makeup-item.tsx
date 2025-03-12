import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AntDesign, FontAwesome5 } from "@expo/vector-icons";
import { MD2Colors, TextInput } from "react-native-paper";

const whiteColor = MD2Colors.white;

interface MakeupItem {
  id: string;
  name: string;
  time: string;
  description: string;
  image: string;
  guidance: string;
  dateOfManufacture: string;
  expirationDate: string;
}
const MakeupItem = () => {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [vip, setVip] = useState(true);
  const [makeupItems, setMakeupItems] = useState<MakeupItem[]>([]);

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
      try {
        const getToken = async () => {
          try {
            if (Platform.OS === "web") {
              return localStorage.getItem("token") || "";
            } else {
              return (await AsyncStorage.getItem("token")) || "";
            }
          } catch (error) {
            return "";
          }
        };

        const token = await getToken();

        if (!token) throw new Error("No authentication token found");

        const response = await fetch(
          "http://192.168.48.183:5280/api/MakeupItems/user/me",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        if (Array.isArray(data)) {
          setMakeupItems(data);
        } else {
          console.error("Invalid data format ", data);
        }
      } catch (error) {
        console.error("Error fetching data: ", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  const handlePress = (makeupItem: MakeupItem) => {
    router.push({
      pathname: "/tabs/collection-details",
      params: { id: makeupItem.id },
    });
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <ScrollView
        contentContainerStyle={[styles.scroll, styles.scrollContainer]}
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
      <View style={styles.buttonField}>
        <View style={styles.container}>
          <Text style={styles.title}>Item storage</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push(`/add-makeup-item`)}
          >
            <Text style={styles.text}>
              ADD <AntDesign name="plus" size={20} />
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.inputField}>
          <TextInput
            style={styles.input}
            placeholder="Search Inventory"
            placeholderTextColor={whiteColor}
            textColor="white"
          />
          <TouchableOpacity>
            <AntDesign name="search1" size={24} color={whiteColor} />
          </TouchableOpacity>
        </View>
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.verticalScroll}
      >
        <View style={styles.gridContainer}>
          {makeupItems.length > 0 ? (
            makeupItems.map((makeupItem) => (
              <TouchableOpacity
                key={makeupItem.id}
                style={styles.item}
                onPress={() => handlePress(makeupItem)}
              >
                {/* <Image
                  source={{
                    uri: `http://192.168.48.183:5280${makeupItem.image}`,
                  }}
                  style={styles.image}
                /> */}
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.noDataText}>No makeup styles available.</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: { flex: 1, backgroundColor: "#F3F4F6" },
  scrollContainer: { paddingHorizontal: 16, paddingBottom: 20 },
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
    marginBottom: 50,
    marginTop: 5,
  },
  button: {
    padding: 12,
    backgroundColor: "#ED1E51",
    borderRadius: 5,
  },
  text: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "black",
  },
  scroll: {
    display: "flex",
    alignItems: "flex-end",
  },
  buttonField: {
    paddingHorizontal: 16, // Thêm khoảng cách 16px ở 2 bên trái/phải
    paddingBottom: 20,
  },
  scrollItem: {
    paddingBottom: 20,
    marginTop: 10,
  },
  container: {
    flexDirection: "row", // Căn theo chiều ngang
    justifyContent: "space-between", // Đẩy hai phần tử ra hai đầu
    alignItems: "center", // Căn giữa theo trục dọc
    paddingHorizontal: 1, // Khoảng cách hai bên
    marginTop: 20,
  },
  inputField: {
    marginTop: 17,
    padding: 0,
    backgroundColor: "#ED1E51",
    borderRadius: 10,
    flexDirection: "row", // Căn theo chiều ngang
    justifyContent: "space-between", // Đẩy hai phần tử ra hai đầu
    alignItems: "center", // Căn giữa theo trục dọc
    paddingHorizontal: 10, // Khoảng cách hai bên
  },
  input: {
    fontStyle: "italic",
    backgroundColor: "#ED1E51",
    color: whiteColor,
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
  containerItem: {
    flexDirection: "row", // Căn theo chiều ngang
    justifyContent: "space-between", // Đẩy hai phần tử ra hai đầu
    alignItems: "center", // Căn giữa theo trục dọc
    paddingHorizontal: 30, // Khoảng cách hai bên
    marginBottom: 30,
  },

  imageItem: {
    width: 127,
    height: 127,
    borderRadius: 16,
  },
  textItem: {
    marginTop: 10,
  },

  verticalScroll: {
    backgroundColor: "#d8d8d870",
    borderRadius: 8,
    padding: 16,
    width: "100%",
    marginBottom: 35,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  item: {
    width: "48%",
    alignItems: "center",
    marginBottom: 16,
  },
  image: {
    width: "100%",
    height: 150,
    borderRadius: 8,
  },
  noDataText: {
    color: "black",
    textAlign: "center",
    marginTop: 20,
  },
});

export default MakeupItem;
