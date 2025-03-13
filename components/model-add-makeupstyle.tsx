import React, { useState } from "react";
import {
  View,
  Text,
  Button,
  Modal,
  StyleSheet,
  Pressable,
  Alert,
  Platform,
} from "react-native";
import * as FileSystem from "expo-file-system"; // For native platforms
import { AntDesign } from "@expo/vector-icons";
interface ModelAddMakeupStyleProps {
  generatedImage: string | null;
  generateStep: string | null;
}
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function ModelAddMakeupStyle({
  generatedImage,
  generateStep,
}: ModelAddMakeupStyleProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [guidance, setGuidance] = useState(generateStep || "Step guidance");
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);

  const saveBase64AsFile = async (base64: string | null, filename: string) => {
    try {
      // Định dạng đường dẫn file
      const filePath = FileSystem.cacheDirectory + filename;
      if (!base64) {
        console.error("Base64 string is null or empty!");
        return;
      }

      await FileSystem.writeAsStringAsync(filePath, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      console.log("File saved at:", filePath);
      return filePath;
    } catch (error) {
      console.error("Lỗi lưu file:", error);
      return null;
    }
  };

  const handleAddMakeupStyle = async () => {
    try {
      const formData = new FormData();
      formData.append("imageFile", {
        uri: generatedImage,
        name: "generated-image.jpg",
        type: "image/jpeg",
      });

      const parseJwt = (token: string): { [key: string]: any } | null => {
        try {
          const base64Url = token.split(".")[1];
          const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
          const jsonPayload = decodeURIComponent(
            atob(base64)
              .split("")
              .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
              .join("")
          );

          return JSON.parse(jsonPayload);
        } catch (e) {
          console.error("Lỗi khi parse token:", e);
          return null;
        }
      };

      const getToken = async () => {
        try {
          if (Platform.OS === "web") {
            return localStorage.getItem("token") || "";
          } else {
            const token = await AsyncStorage.getItem("token");
            return token || "";
          }
        } catch (error) {
          console.error("🚨 Lỗi lấy token:", error);
          return "";
        }
      };
      const token = await getToken();
      const decodedToken = parseJwt(token);

      console.log("decodedToken: ", decodedToken);
      if (decodedToken && decodedToken.id) {
        formData.append("userId", String(decodedToken.id));
      } else {
        console.error("Không tìm thấy userId trong token!");
      }

      formData.append("guidance", guidance);

      const response = await fetch(
        "http://192.168.11.183:5280/api/MakeupStyles",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP Error ${response.status}: ${errorText}`);
      } else {
        console.log("add successfully!");

        setSuccessModalVisible(true);
        setIsDisabled(true);
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      Alert.alert("Lỗi", "Đã có lỗi xảy ra. Vui lòng thử lại!");
    }
  };

  return (
    <View style={styles.container}>
      <View style={{ position: "absolute", top: 10, right: 0 }}>
        <AntDesign
          name="save"
          style={[styles.saveIcon, isDisabled && { opacity: 0.5 }]} 
          size={30}
          onPress={() => !isDisabled && setModalVisible(true)} 
        />
      </View>

      <Modal visible={modalVisible} animationType="fade" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.text}>
              Do you want to add this makeup style to your favorite styles?
            </Text>

            <View style={styles.buttonContainer}>
              <Pressable
                style={styles.buttonCancel}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </Pressable>

              <Pressable
                style={styles.buttonConfirm}
                onPress={() => {
                  handleAddMakeupStyle();
                  setModalVisible(false);
                }}
              >
                <Text style={styles.buttonText}>OK</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={successModalVisible} animationType="fade" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.text}>Makeup style added successfully!</Text>

            <Pressable
              style={styles.buttonConfirm}
              onPress={() => setSuccessModalVisible(false)}
            >
              <Text style={styles.buttonText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },

  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },

  modalContent: {
    width: 300,
    height: 120,
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
    alignItems: "center",
  },

  text: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },

  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },

  buttonConfirm: {
    backgroundColor: "#4CAF50",
    padding: 5,
    borderRadius: 5,
    flex: 1,
    alignItems: "center",
    width: 100,
  },

  buttonCancel: {
    backgroundColor: "#FF5733",
    padding: 10,
    borderRadius: 5,
    flex: 1,
    alignItems: "center",
    marginRight: 10,
  },

  buttonText: { fontSize: 16, color: "white", fontWeight: "bold" },

  saveIcon: {
    display: "flex",
    justifyContent: "flex-end",
  },
});
