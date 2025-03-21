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
import { AntDesign } from "@expo/vector-icons";
interface ModelAddMakeupStyleProps {
  generatedImage: string | null;
  generateStep: string | null;
}
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

export default function ModelAddMakeupStyle({
  generatedImage,
  generateStep,
}: ModelAddMakeupStyleProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [guidance, setGuidance] = useState(generateStep || "Step guidance");
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const [limitModalVisible, setLimitModalVisible] = useState(false);

  const handleAddMakeupStyle = async () => {
    try {
      const formData = new FormData();

      if (generatedImage && !generatedImage.includes("/uploads")) {
        const file = {
          uri: generatedImage,
          name: "generated-image.jpg",
          type: "image/jpeg",
        };

        formData.append("imageFile", file as any);
      }

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

      const token = await AsyncStorage.getItem("token");
      const decodedToken = parseJwt(token || "");

      console.log("decodedToken: ", decodedToken);
      if (decodedToken && decodedToken.id) {
        formData.append("userId", String(decodedToken.id));
      } else {
        console.error("Không tìm thấy userId trong token!");
      }

      formData.append("guidance", guidance);

      const response = await fetch(
        "http://192.168.68.102:5280/api/MakeupStyles",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );
      if (!response.ok) {
        if (response.status === 400) {
          setLimitModalVisible(true);
        }
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
      <View style={{ position: "absolute", top: 8, right: 0 }}>
        <AntDesign
          name="save"
          style={[styles.saveIcon, isDisabled && { opacity: 0.5 }]}
          size={24}
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

      <Modal visible={limitModalVisible} animationType="fade" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.text}>Storage limite reached! do you want to upgrade ?</Text>

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
                  setLimitModalVisible(false);
                  router.push("/(root)/tabs/unlimited-storage")
                }}
              >
                <Text style={styles.buttonText}>Upgrade</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={successModalVisible} animationType="fade" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContentSuccess}>
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
    height: 140,
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
    alignItems: "center",
  },
  modalContentSuccess: {
    width: 300,
    height: 120,
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
    alignItems: "center",
  },

  text: {
    fontSize: 16,
    fontFamily: "PlayfairDisplay-Bold",
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
    justifyContent: "center",
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

  buttonText: {
    fontSize: 16,
    color: "white",
    fontFamily: "PlayfairDisplay-Bold",
  },

  saveIcon: {
    display: "flex",
    justifyContent: "flex-end",
    color: "#ED1E51",
  },
});
