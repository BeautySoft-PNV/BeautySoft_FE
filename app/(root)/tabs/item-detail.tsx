import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AntDesign, FontAwesome5 } from "@expo/vector-icons";
import { FontAwesome } from "@expo/vector-icons";
import moment from "moment";

interface ItemData {
  id: string;
  name: string;
  description: string;
  guidance: string;
  image: string;
  dateOfManufacture: string;
  expirationDate: string;
}

const ItemDetail = () => {
  const { id } = useLocalSearchParams();
  const [itemData, setItemData] = useState<ItemData | null>(null);
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [vip, setVip] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
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
        console.log("data: ", data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleDelete = async () => {
    try {
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
      const response = await fetch(
        `http://192.168.11.183:5280/api/MakeupItems/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok)
        throw new Error(`HTTP error! Status: ${response.status}`);

      router.push("/(root)/(tabs)/makeup-item");
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };


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
      <View style={styles.header}>
        <TouchableOpacity
          style={{ marginLeft: "7%" }}
          onPress={() => router.push("/(root)/(tabs)/home")}
        >
          <FontAwesome name="chevron-left" size={24} color="#ED1E51" />
        </TouchableOpacity>
        <Text style={styles.titleItem}>Item Storage</Text>
        <TouchableOpacity
          style={{ marginRight: "10%" }}
          onPress={() => setModalVisible(true)}
        >
          <FontAwesome name="times" size={24} color="#ED1E51" />
        </TouchableOpacity>
      </View>

      <ScrollView>
        <View style={styles.containerItemDetail}>
          <Image
            source={{
              uri: itemData?.image,
            }}
            style={styles.image}
          />
          <View style={styles.itemContainer}>
            <Text style={styles.title}>Item: {itemData?.name}</Text>
            <View style={styles.timeContainer}>
              <FontAwesome name="calendar" size={14} color="black" />
              <Text style={styles.time}>
                Date of Manuafacture:{" "}
                {moment(itemData?.dateOfManufacture).format(
                  "DD/MM/YYYY hh:mm A"
                )}
              </Text>
            </View>
            <View style={styles.timeContainer}>
              <FontAwesome name="calendar" size={14} color="black" />
              <Text style={styles.time}>
                Expiration Date:{" "}
                {moment(itemData?.expirationDate).format("DD/MM/YYYY hh:mm A")}
              </Text>
            </View>

            <Text>
              <Text style={{ fontWeight: "bold" }}>Description: </Text>
              {itemData?.description}
            </Text>

            <Text>
              <Text style={{ fontWeight: "bold" }}>Guidance: </Text>
              {itemData?.guidance}
            </Text>
          </View>
          <View style={{ display: "flex", alignItems: "flex-end" }}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                router.push({
                  pathname: "/(root)/tabs/edit-item",
                  params: {
                    id: itemData?.id,
                    name: itemData?.name,
                    image: itemData?.image,
                    description: itemData?.description,
                    guidance: itemData?.guidance,
                    dateOfManufacture: itemData?.dateOfManufacture,
                    expirationDate: itemData?.expirationDate,
                  },
                });
              }}
            >
              <Text style={styles.text}>EDIT</Text>
            </TouchableOpacity>
          </View>
        </View>
        <Modal
          transparent={true}
          animationType="slide"
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Delete Item Storage</Text>
              <Text style={styles.modalMessage}>
                Are you sure you want to delete "{itemData?.name}"?
              </Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.cancelText}>No, Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={handleDelete}
                >
                  <Text style={styles.deleteText}>Yes, Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: { backgroundColor: "#F3F4F6" },
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
  header: {
    marginTop: 30,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  titleItem: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ED1E51",
    fontFamily: "PlayfairDisplay-Bold",
  },
  image: {
    width: "100%",
    height: 150,
    borderRadius: 8,
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
    marginTop: 50,
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
    marginTop: 10,
  },
  time: {
    color: "black",
    fontFamily: "PlayfairDisplay-Medium",
    fontWeight: "bold",
  },
  itemContainer: {
    marginTop: 15,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    width: "80%",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    fontFamily: "PlayfairDisplay-Medium",
  },
  modalMessage: {
    marginBottom: 10,
    textAlign: "center",
    fontFamily: "PlayfairDisplay-Medium",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  cancelButton: {
    backgroundColor: "lightgray",
    padding: 10,
    borderRadius: 5,
    marginRight: 10,
    flex: 1,
    alignItems: "center",
  },
  deleteButton: {
    backgroundColor: "#ED1E51",
    padding: 10,
    borderRadius: 5,
    flex: 1,
    alignItems: "center",
  },
  cancelText: {
    color: "black",
    fontFamily: "PlayfairDisplay-Medium",
  },
  deleteText: {
    color: "white",
    fontFamily: "PlayfairDisplay-Medium",
  },
  button: {
    padding: 12,
    backgroundColor: "#ED1E51",
    borderRadius: 5,
    width: 80,
    alignItems: "center", // Căn giữa theo chiều ngang
    justifyContent: "center", // Căn giữa theo chiều dọc
  },
  text: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },
});

export default ItemDetail;
