import { CameraView, useCameraPermissions } from "expo-camera";
import React, { useState, useRef, useEffect } from "react";
import {
  Button,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  TextInput,
  Platform,
  Modal,
  Pressable,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { FontAwesome } from "@expo/vector-icons";

export default function AddMakeupItem() {
  const [facing, setFacing] = useState<"front" | "back">("back");
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView | null>(null);

  const [name, setName] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [guidance, setGuidance] = useState("");
  const [manufactureDate, setManufactureDate] = useState("");
  const [expirationDate, setExpirationDate] = useState("");
  const inputRef = useRef(null);
  const [error, setError] = useState("");
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [manufactureDateError, setManufactureDateError] = useState("");
  const [expirationDateError, setExpirationDateError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Request permision for Camera!</Text>
        <Button onPress={requestPermission} title="Permision" />
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing((current) => (current === "back" ? "front" : "back"));
  }

  async function takePicture() {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync();
      if (photo) {
        setCapturedImage(photo.uri);
      }
    }
  }

  function retakePicture() {
    setCapturedImage(null);
  }
  const formatDateTime = (text: any) => {
    let numbersOnly = text.replace(/\D/g, "");

    let formatted = numbersOnly
      .replace(/^(\d{2})(\d{0,2})/, "$1/$2")
      .replace(/^(\d{2}\/\d{2})(\d{0,4})/, "$1/$2");
    formatted = formatted.replace(/(\d{2}\/\d{2}\/\d{4})\d+/, "$1");

    return formatted.trim();
  };

  const validateDateTime = (text: any) => {
    const parts = text.match(/(\d{2})\/(\d{2})\/(\d{4})/);
    if (!parts) return "Incorrect format";

    let [_, day, month, year] = parts.map(Number);
    if (day < 1 || day > 31) return "Invalid date";
    if (month < 1 || month > 12) return "Invalid month";
    if (year < 1900 || year > 2100) return "Invalid year";
    return "";
  };

  const handleManufactureDateChange = (text: string) => {
    let cleanedText = text.replace(/[^0-9\/: ]/g, "");
    let formatted =
      cleanedText.length >= manufactureDate.length
        ? formatDateTime(cleanedText)
        : cleanedText;
    if (formatted !== manufactureDate) {
      setManufactureDate(formatted);
      setManufactureDateError(validateDateTime(text));
    }
  };
  const handleExpirationDateChange = (text: string) => {
    let cleanedText = text.replace(/[^0-9\/: ]/g, "");
    let formatted =
      cleanedText.length >= expirationDate.length
        ? formatDateTime(cleanedText)
        : cleanedText;
    if (formatted !== expirationDate) {
      setExpirationDate(formatted);
      setExpirationDateError(validateDateTime(text));
    }
  };

  const handleAddMakeupItem = async () => {
    type ErrorType = {
      name?: string;
      manufactureDate?: string;
      expirationDate?: string;
      description?: string;
      guidance?: string;
    };

    let newErrors: ErrorType = {};

    if (!name.trim()) {
      newErrors.name = "Name is required!";
    }
    if (!manufactureDate.trim()) {
      newErrors.manufactureDate = "Manufacture date is required!";
    }
    if (!expirationDate.trim()) {
      newErrors.expirationDate = "Expiration date is required!";
    } else if (new Date(expirationDate) < new Date(manufactureDate)) {
      newErrors.expirationDate =
        "Expiration date must be after manufacture date!";
    }
    if (!description.trim()) {
      newErrors.description = "Description is required!";
    }
    if (!guidance.trim()) {
      newErrors.guidance = "Guidance is required!";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    } else {
      setLoading(true);
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
        console.error("Error when parse token:", e);
        return null;
      }
    };
    const token = await AsyncStorage.getItem("token");
    const formData = new FormData();
    const decodedToken = parseJwt(token || "");

    if (decodedToken && decodedToken.id) {
      formData.append("UserId", String(decodedToken.id));
    } else {
      console.error("Can not find UserId from token!");
    }

    function convertToISOFormat(dateString: any) {
      const [day, month, yearAndTime] = dateString.split("/");
      const [year, time] = yearAndTime.split(" ");
      return `${year}-${month}-${day}T${time}:00`;
    }

    let formattedManufactureDate = convertToISOFormat(manufactureDate);
    let formattedExpirationDate = convertToISOFormat(expirationDate);

    formData.append("Name", name);
    formData.append("Description", description);
    if (capturedImage && !capturedImage.includes("/uploads")) {
      const file = {
        uri: capturedImage,
        name: "photo.jpg",
        type: "image/jpeg",
      };

      formData.append("imageFile", file as any);
    }
    formData.append("Guidance", guidance);
    formData.append("DateOfManufacture", formattedManufactureDate);
    formData.append("ExpirationDate", formattedExpirationDate);

    const response = await fetch("http://192.168.2.155:5280/api/MakeupItems", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
    if (!response.ok) {
      const errorText = await response.text();
      setLoading(false);
      throw new Error(`HTTP Error ${response.status}: ${errorText}`);
    } else {
      setLoading(false);
      setSuccessModalVisible(true);
      router.push("/(root)/(tabs)/makeup-item");
    }
  };
  return (
    <View style={styles.container}>
      {!capturedImage ? (
        <>
          <CameraView ref={cameraRef} style={styles.camera} facing={facing} />
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.buttonChangeCamera}
              onPress={toggleCameraFacing}
            >
              <Text style={styles.text}>
                <FontAwesome name="exchange" size={20} color="white" /> Change
                camera
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.buttonTakePicture}
              onPress={takePicture}
            >
              <Text style={styles.text}>
                <FontAwesome name="camera-retro" size={20} color="white" /> Take
                a picture
              </Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <View style={styles.container}>
          <View style={styles.imageContainer}>
            <Image source={{ uri: capturedImage }} style={styles.preview} />
            <TouchableOpacity
              style={styles.retakeButton}
              onPress={retakePicture}
            >
              <Text style={styles.text}>🔄 ReTake</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Text style={styles.title}>Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Lips..."
                placeholderTextColor="#C4C4C4"
                autoCapitalize="none"
                value={name}
                onChangeText={(text) => {
                  setName(text);
                  setErrors((prev) => ({ ...prev, name: "" }));
                }}
              />
              {errors.name ? (
                <Text style={styles.errorText}>{errors.name}</Text>
              ) : null}

              <Text style={styles.title}>Date of Manufacture</Text>
              <TextInput
                ref={inputRef}
                style={[styles.input, error ? styles.inputError : null]}
                placeholder="DD/MM/YYYY"
                value={manufactureDate}
                onChangeText={handleManufactureDateChange}
                keyboardType="number-pad"
                maxLength={16}
              />
              {manufactureDateError ? (
                <Text style={styles.errorText}>{manufactureDateError}</Text>
              ) : null}

              <Text style={styles.title}>Expiration Date</Text>
              <TextInput
                ref={inputRef}
                style={[styles.input, error ? styles.inputError : null]}
                placeholder="DD/MM/YYYY"
                value={expirationDate}
                onChangeText={handleExpirationDateChange}
                keyboardType="number-pad"
                maxLength={16}
              />
              {expirationDateError ? (
                <Text style={styles.errorText}>{expirationDateError}</Text>
              ) : null}
              <Text style={styles.title}>Description</Text>
              <TextInput
                style={styles.input}
                placeholder="Description..."
                placeholderTextColor="#C4C4C4"
                autoCapitalize="none"
                value={description}
                onChangeText={(text) => {
                  setDescription(text);
                  setErrors((prev) => ({ ...prev, description: "" }));
                }}
              />
              {errors.description ? (
                <Text style={styles.errorText}>{errors.description}</Text>
              ) : null}

              <Text style={styles.title}>Guidance</Text>
              <TextInput
                style={styles.input}
                placeholder="Guidance..."
                placeholderTextColor="#C4C4C4"
                autoCapitalize="none"
                value={guidance}
                onChangeText={(text) => {
                  setGuidance(text);
                  setErrors((prev) => ({ ...prev, guidance: "" }));
                }}
              />
              {errors.guidance ? (
                <Text style={styles.errorText}>{errors.guidance}</Text>
              ) : null}
              {loading ? (
                <Modal transparent animationType="fade">
                  <View style={styles.modalOverlay}>
                    <View style={styles.modalContentLoading}>
                      <ActivityIndicator size="large" color="white" />
                      <Text style={styles.modalText}>
                        Processing request...
                      </Text>
                    </View>
                  </View>
                </Modal>
              ) : (
                <Modal
                  visible={successModalVisible}
                  animationType="fade"
                  transparent
                >
                  <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                      <Text style={styles.text}>
                        Makeup item added successfully!
                      </Text>
                      <Pressable
                        style={styles.buttonConfirm}
                        onPress={() => setSuccessModalVisible(false)}
                      >
                        <Text style={styles.buttonText}>Close</Text>
                      </Pressable>
                    </View>
                  </View>
                </Modal>
              )}
            </View>
          </ScrollView>
          <View style={styles.buttonSubmit}>
            <TouchableOpacity
              style={styles.button}
              onPress={handleAddMakeupItem}
            >
              <Text style={styles.buttonText}>Submit</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f0f0",
  },
  message: {
    textAlign: "center",
    paddingBottom: 10,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    position: "absolute",
    bottom: 100,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-evenly",
    padding: 10,
  },
  buttonChangeCamera: {
    padding: 12,
    backgroundColor: "#007AFF",
    borderRadius: 5,
  },
  buttonTakePicture: {
    padding: 12,
    backgroundColor: "#ED1E51",
    borderRadius: 5,
  },
  text: {
    fontSize: 16,
    fontFamily: "PlayfairDisplay-Medium",
    color: "white",
  },
  previewContainer: {
    flex: 1,
    alignItems: "center",
    width: "100%",
  },
  imageContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 5,
  },
  preview: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  inputContainer: {
    flex: 1,
    padding: 10,
    backgroundColor: "white",
  },
  input: {
    width: 330,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginBottom: 20,
    backgroundColor: "white",
    fontFamily: "PlayfairDisplay-Bold",
    fontSize: 16,
    color: "black",
  },
  uploadImage: {
    marginLeft: 20,
  },
  retakeButton: {
    position: "absolute",
    bottom: 10,
    right: 10,
    backgroundColor: "#007AFF",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    alignItems: "center",
  },
  iconStyle: {
    marginLeft: 10,
  },
  errorText: {
    color: "red",
    fontFamily: "PlayfairDisplay-Bold",
    fontSize: 14,
    alignSelf: "flex-start",
    marginBottom: 5,
    marginTop: -15,
  },
  title: {
    fontSize: 18,
    fontFamily: "PlayfairDisplay-Bold",
    color: "black",
    marginBottom: 5,
    alignSelf: "flex-start",
  },
  noticed: {
    color: "red",
  },
  textPlaceholder: {
    color: "#C4C4C4",
  },
  textSelected: {
    color: "#000",
  },
  inputError: { borderColor: "red" },
  error: { color: "red", marginTop: 5 },
  button: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ED1E51",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginVertical: 20,
    width: 200,
    fontSize: 18,
    fontWeight: "bold",
    fontFamily: "PlayfairDisplay-Bold",
  },
  buttonText: {
    fontSize: 18,
    fontFamily: "PlayfairDisplay-Bold",
    color: "white",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: 330,
    height: 100,
    padding: 10,
    backgroundColor: "white",
    borderRadius: 10,
    alignItems: "center",
  },
  buttonConfirm: {
    backgroundColor: "#4CAF50",
    padding: 7,
    marginTop: 10,
    marginBottom: 10,
    borderRadius: 5,
    flex: 1,
    alignItems: "center",
    width: 100,
    height: 50,
  },
  formContainer: {
    flex: 2,
    paddingHorizontal: 5,
  },
  buttonSubmit: {
    alignItems: "center",
    justifyContent: "center",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  modalText: {
    marginTop: 10,
    color: "white",
    fontFamily: "PlayfairDisplay-Bold",
  },
  modalContentLoading: {
    width: 200,
    padding: 20,
    backgroundColor: "#ED1E51",
    borderRadius: 10,
    alignItems: "center",
  },
});
