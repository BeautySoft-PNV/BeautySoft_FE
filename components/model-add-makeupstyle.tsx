import React, { useState } from "react";
import { View, Text, Button, Modal, StyleSheet, Pressable, Alert } from "react-native";

interface ModelAddMakeupStyleProps {
  generatedImage: string | null;
  generateStep: string | null;
}

export default function ModelAddMakeupStyle({ generatedImage, generateStep }: ModelAddMakeupStyleProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [name, setName] = useState("Make yp like Vietnam brial");
  const [guidance, setGuidance] = useState(generateStep || "Step guidance");

  const handleAddMakeupStyle = async () => {
    try {
      if (!name || !generatedImage) {
        Alert.alert("Lỗi", "Vui lòng nhập tên và chọn ảnh.");
        return;
      }
      console.log("add ")
      const formData = new FormData();
      formData.append("UserId", "1");
      formData.append("Name", name);
      formData.append("Guidance", guidance);
      formData.append("Image", {
        uri: generatedImage,
        type: "image/jpeg",
        name: "makeup.jpg",
      } as any);
  
      const response = await fetch(
        "http://192.168.48.183:5280/api/MakeupStyles",
        {
          method: "POST",
          headers: {
            Authorization: `sk-kyVgdjaxGbxuYT5mWVRpYnHvPP3kwvWXN9OXpVwdVbneOqSu`,
            Accept: "application/json",
          },
          body: formData,
        }
      );
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error("API Error:", errorData);
        Alert.alert("Lỗi", "Không thể thêm phong cách trang điểm.");
        return;
      }
  
      const data = await response.json();
      console.log("Data:", data);
      Alert.alert("Thành công", "Phong cách trang điểm đã được thêm!");
      
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
            <Text style={styles.text}>Do you want to add this makeup style to your favorite styles?</Text>

            <View style={styles.buttonContainer}>
              <Pressable style={styles.buttonCancel} onPress={() => setModalVisible(false)}>
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
            <Text style={styles.text}>Makeup style has been added successfully!</Text>
            <Pressable style={styles.buttonConfirm} onPress={() => setConfirmVisible(false)}>
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
