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

export default function ModelAddMakeupStyle({
  generatedImage,
  generateStep,
}: ModelAddMakeupStyleProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [guidance, setGuidance] = useState(generateStep || "Step guidance");
  const [successModalVisible, setSuccessModalVisible] = useState(false);

  const handleAddMakeupStyle = async () => {
    try {
      if (!generatedImage) {
        console.log("generatedImage: ", generatedImage);
        Alert.alert("Lỗi", "Vui lòng nhập tên và chọn ảnh.");
        return;
      }
      console.log("add ");

      const formData = new FormData();
      // formData.append("UserId", userId);

      console.log("Generated Image Type:", generatedImage);
      console.log("Generated Image Type:", typeof generatedImage);

      let fileBlob;

      if (Platform.OS === "web") {
        const response = await fetch(generatedImage);
        fileBlob = await response.blob();
      } else {
        const fileInfo = await FileSystem.getInfoAsync(generatedImage);
        if (!fileInfo.exists) {
          throw new Error("File does not exist");
        }

        const fileBase64 = await FileSystem.readAsStringAsync(generatedImage, {
          encoding: FileSystem.EncodingType.Base64,
        });

        fileBlob = await fetch(`data:image/jpeg;base64,${fileBase64}`).then(
          (res) => res.blob()
        );
      }

      if (generatedImage) {
        const response = await fetch(generatedImage);
        const blob = await response.blob();
        const contentType = response.headers.get("Content-Type") || "image/png";
        const extension = contentType.split("/")[1] || "jpg";
        const filename = `${Date.now()}.${extension}`;
        const imageFile = new File([blob], filename, {
          type: contentType,
          lastModified: Date.now(),
        });

        formData.append("imageFile", imageFile);
        console.log("imageFile: ", imageFile);
      }

      if (Platform.OS === "web") {
        const response = await fetch(generatedImage);
        const blob = await response.blob();
        formData.append(
          "imageFile",
          new File([blob], "image.jpg", {
            type: "image/jpeg",
            lastModified: Date.now(),
          })
        );
      } else {
        formData.append("imageFile", {
          uri: generatedImage,
          name: "image.jpg",
          type: "image/jpeg",
        } as any);
      }
      // parse user information
      const parseJwt = (token: string): { [key: string]: any } | null => {
        try {
          const base64Url = token.split(".")[1]; // Lấy phần payload
          const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/"); // Chuẩn hóa base64
          const jsonPayload = decodeURIComponent(
            atob(base64)
              .split("")
              .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
              .join("")
          );

          return JSON.parse(jsonPayload); // Trả về object JSON
        } catch (e) {
          console.error("Lỗi khi parse token:", e);
          return null;
        }
      };

      const token = localStorage.getItem("token");
      const decodedToken = parseJwt(token);

      console.log("decodedToken: ", decodedToken);
      if (decodedToken && decodedToken.id) {
        formData.append("userId", String(decodedToken.id)); // Đảm bảo kiểu string
      } else {
        console.error("Không tìm thấy userId trong token!");
      }

      // formData.append("userId", 44);

      formData.append("guidance", guidance);

      for (let pair of formData.entries()) {
        console.log(`📌 ${pair[0]}: ${pair[1]}`);
      }

      const response = await fetch(
        "http://192.168.48.183:5280/api/MakeupStyles",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: formData,
        }
      );

      // 🛠️ Kiểm tra response có nội dung hay không trước khi parse JSON
      if (!response.ok) {
        const errorText = await response.text(); // Lấy nội dung lỗi
        throw new Error(`HTTP Error ${response.status}: ${errorText}`);
      } else {
        console.log("add successfully!");
        // ✅ Hiển thị modal thành công
        setSuccessModalVisible(true);
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      Alert.alert("Lỗi", "Đã có lỗi xảy ra. Vui lòng thử lại!");
    }
  };

  return (
    <View style={styles.container}>
      <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
        <AntDesign
          name="save"
          style={styles.saveIcon}
          size={30}
          onPress={() => setModalVisible(true)}
        />
      </View>

      {/* Modal xác nhận thêm phong cách */}
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

      {/* Modal thông báo thành công */}
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
    padding: 10,
    borderRadius: 5,
    flex: 1,
    alignItems: "center",
  },

  buttonCancel: {
    backgroundColor: "#FF5733",
    padding: 10,
    borderRadius: 5,
    flex: 1,
    alignItems: "center",
    marginRight: 10,
  },

  buttonText: { color: "white", fontWeight: "bold" },

  saveIcon: {
    display: "flex",
    justifyContent: "flex-end",
  },
});
