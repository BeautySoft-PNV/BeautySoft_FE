import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AntDesign, FontAwesome5 } from "@expo/vector-icons";
import { MD2Colors, TextInput } from "react-native-paper";

const whiteColor = MD2Colors.white;

const Home = () => {
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
            // onPress={takePicture}
          >
            <Text style={styles.text}>
              ADD <AntDesign name="plus" size={20}></AntDesign>
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
      <ScrollView style={styles.scrollItem} >
        <View style={styles.containerItem}>
          <TouchableOpacity>
            <Image
              style={styles.imageItem}
              source={require("../../../assets/images/makeupItem8.png")}
            />
            <Text style={styles.textItem}>Background A12</Text>
          </TouchableOpacity>
          <TouchableOpacity>
            <Image
              style={styles.imageItem}
              source={require("../../../assets/images/makeupItem7.png")}
            />
            <Text style={styles.textItem}>Eye shadow</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.containerItem}>
          <TouchableOpacity>
            <Image
              style={styles.imageItem}
              source={require("../../../assets/images/makeupItem9.png")}
            />
            <Text style={styles.textItem}>Glitter</Text>
          </TouchableOpacity>
          <TouchableOpacity>
            <Image
              style={styles.imageItem}
              source={require("../../../assets/images/makeupItem10.png")}
            />
            <Text style={styles.textItem}>Makeup brush</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.containerItem}>
          <TouchableOpacity>
            <Image
              style={styles.imageItem}
              source={require("../../../assets/images/makeupItem11.png")}
            />
            <Text style={styles.textItem}>Makeup sponge</Text>
          </TouchableOpacity>
          <TouchableOpacity>
            <Image
              style={styles.imageItem}
              source={require("../../../assets/images/makeupItem12.png")}
            />
            <Text style={styles.textItem}>Blush</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.containerItem}>
          <TouchableOpacity>
            <Image
              style={styles.imageItem}
              source={require("../../../assets/images/makeupItem13.png")}
            />
            <Text style={styles.textItem}>Foundation</Text>
          </TouchableOpacity>
          <TouchableOpacity>
            <Image
              style={styles.imageItem}
              source={require("../../../assets/images/makeupItem14.png")}
            />
            <Text style={styles.textItem}>Concearler</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.containerItem}>
          <TouchableOpacity>
            <Image
              style={styles.imageItem}
              source={require("../../../assets/images/makeupItem15.png")}
            />
            <Text style={styles.textItem}>Eyebrow pencil</Text>
          </TouchableOpacity>
          <TouchableOpacity>
            <Image
              style={styles.imageItem}
              source={require("../../../assets/images/makeupItem16.png")}
            />
            <Text style={styles.textItem}>Eyeliner</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.containerItem}>
          <TouchableOpacity>
            <Image
              style={styles.imageItem}
              source={require("../../../assets/images/makeupItem17.png")}
            />
            <Text style={styles.textItem}>Powder</Text>
          </TouchableOpacity>
          <TouchableOpacity>
            <Image
              style={styles.imageItem}
              source={require("../../../assets/images/makeupItem18.png")}
            />
            <Text style={styles.textItem}>Lips gloss</Text>
          </TouchableOpacity>
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
    paddingBottom: 20
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
    marginBottom: 30
    
  },

  imageItem: {
    width: 127,
    height: 127,
    borderRadius: 16,
  },
  textItem: {
    marginTop: 10,
  },
});

export default Home;
