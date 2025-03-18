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
  const [loading, setLoading] = useState(true);
  const [makeupItems, setMakeupItems] = useState<MakeupItem[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");

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
          "http://192.168.31.183:5280/api/MakeupItems/user/me",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          if (response.status === 404) {
            console.warn("API trả về 404 - Không tìm thấy dữ liệu");
            return null;
          }
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
      pathname: "/tabs/item-detail",
      params: { id: makeupItem.id },
    });
  };
  const filteredItems = makeupItems.filter((item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.buttonField}>
        <View style={styles.container}>
          <Text style={styles.title}>Item storage</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push("/add-makeup-item")}
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
              value={searchQuery}
              onChangeText={setSearchQuery}
          />
          <TouchableOpacity>
            <AntDesign name="search1" size={24} color={whiteColor} />
          </TouchableOpacity>
        </View>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} style={styles.verticalScroll}>
        <View style={styles.gridContainer}>
          {filteredItems.length > 0 ? (
              filteredItems.map((makeupItem) => (
                  <TouchableOpacity
                      key={makeupItem.id}
                      style={styles.item}
                      onPress={() => handlePress(makeupItem)}
                  >
                    <Image source={{ uri: makeupItem.image }} style={styles.image} />
                    <Text style={styles.title}>{makeupItem?.name}</Text>
                  </TouchableOpacity>
              ))
          ) : (
              <Text style={styles.noDataText}>No matching makeup items found.</Text>
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
    marginBottom: 80,
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
