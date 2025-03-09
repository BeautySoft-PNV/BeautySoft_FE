import React, { useState } from "react";
import {
  View,
  Text,
  Button,
  Modal,
  StyleSheet,
  Pressable,
  Alert,
} from "react-native";

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

  const handleAddMakeupStyle = async () => {
    try {
      generatedImage =
        "https://media.istockphoto.com/id/1686261974/vector/penguin-cry-cute-cartoon-vector-animal-illustration.jpg?s=612x612&w=0&k=20&c=cMT9ogpZHCtOw1z-jtmmI7QAHMRVpA7WLEiZ9x0lhcU=";
      if (!generatedImage) {
        console.log("generatedImage: ", generatedImage);
        Alert.alert("Lỗi", "Vui lòng nhập tên và chọn ảnh.");
        return;
      }
      console.log("add ");
      

      const User = JSON.parse(localStorage.getItem("user") || "{}");
      const userId = User.id;
      const formData = new FormData();
      formData.append("UserId", userId);

      console.log("Generated Image Type:", generatedImage);
      console.log("Generated Image Type:", typeof generatedImage);

        if (generatedImage.startsWith("data:image")) {
          const file = base64ToFile(generatedImage, "image.png");
          formData.append("Image",file)
          console.log("Generated Image Type (Base64):", typeof generatedImage);
        } else {
          // Nếu ảnh là URL
          try {
            const response = await fetch(generatedImage);
            const blob = await response.blob();
            const contentType =
              response.headers.get("Content-Type") || "image/png";
            const extension = contentType.split("/")[1] || "jpg";
            const filename = `${Date.now()}.${extension}`;

            const imageFile = new File([blob], filename, {
              type: contentType,
              lastModified: Date.now(),
            });
            formData.append("Image", imageFile);
            console.log("image: ", imageFile);
          } catch (error) {
            console.error("Error fetching image:", error);
            return null; // Trả về null nếu có lỗi
          }
        }

        formData.append("Guidance", guidance)

      // Hàm chuyển đổi Base64 thành File
      function base64ToFile(base64String: string, fileName: string): File {
        let arr = base64String.split(",");
        let mime = arr[0].match(/:(.*?);/)?.[1] || "image/png"; // ✅ Thêm kiểm tra null
        let bstr = atob(arr[1]);
        let n = bstr.length;
        let u8arr = new Uint8Array(n);

        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }

        // ✅ Chuyển Uint8Array thành Blob trước khi tạo File
        let blob = new Blob([u8arr], { type: mime });

        return new File([blob], fileName, {
          type: mime,
          lastModified: Date.now(), // ✅ Bổ sung lastModified để tránh lỗi khác
        });
      }

      for (let pair of formData.entries()) {
        console.log(`📌 ${pair[0]}: ${pair[1]}`);
      }

      const response = await fetch(
        "http://192.168.175.183:5280/api/MakeupStyles",
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
      }

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const responseData = await response.json();
        console.log("Response:", responseData);
      } else {
        console.log("Response is not JSON:", await response.text());
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      Alert.alert("Lỗi", "Đã có lỗi xảy ra. Vui lòng thử lại!");
    }
  };

  return (
    <View style={styles.container}>
      <Button title="Add Makeup Style" onPress={() => setModalVisible(true)} />

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

      {/* Modal thông báo khi thêm thành công */}
      <Modal visible={confirmVisible} animationType="fade" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.text}>
              Makeup style has been added successfully!
            </Text>
            <Pressable
              style={styles.buttonConfirm}
              onPress={() => setConfirmVisible(false)}
            >
              <Text style={styles.buttonText}>OK</Text>
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
});
