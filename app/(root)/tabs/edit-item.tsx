import { CameraView, useCameraPermissions } from "expo-camera";
import React, { useEffect, useState, useRef } from "react";
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
import { useLocalSearchParams } from "expo-router";
import moment from "moment";

export default function EditMakeupItem() {
  const [facing, setFacing] = useState<"front" | "back">("back");
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView | null>(null);

  const params = useLocalSearchParams();
  const id = params.id;
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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (params) {
      setName(Array.isArray(params.name) ? params.name[0] : params.name || "");
      setCapturedImage(
        Array.isArray(params.image) ? params.image[0] : params.image || null
      );
      setDescription(
        Array.isArray(params.description)
          ? params.description[0]
          : params.description || ""
      );
      setGuidance(
        Array.isArray(params.guidance)
          ? params.guidance[0]
          : params.guidance || ""
      );
      setManufactureDate(
        params.dateOfManufacture && moment(params.dateOfManufacture).isValid()
          ? moment(params.dateOfManufacture).format("DD/MM/YYYY HH:mm")
          : ""
      );
      setExpirationDate(
        params.expirationDate && moment(params.expirationDate).isValid()
          ? moment(params.expirationDate).format("DD/MM/YYYY HH:mm")
          : ""
      );
    }
  }, []);

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
      .replace(/^(\d{2}\/\d{2})(\d{0,4})/, "$1/$2")
      .replace(/^(\d{2}\/\d{2}\/\d{4})(\d{0,2})/, "$1 $2")
      .replace(/^(\d{2}\/\d{2}\/\d{4} \d{2})(\d{0,2})/, "$1:$2");

    return formatted.trim();
  };

  const validateDateTime = (text: any) => {
    const parts = text.match(/(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2})/);
    if (!parts) return "Incorrect format";

    let [_, day, month, year, hour, minute] = parts.map(Number);
    if (day < 1 || day > 31) return "Invalid date";
    if (month < 1 || month > 12) return "Invalid month";
    if (year < 1900 || year > 2100) return "Invalid year";
    if (hour > 23) return "Invalid time";
    if (minute > 59) return "Invalid minute";

    return "";
  };

  const handleEditMakeupItem = async () => {
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
        console.error("Lỗi khi parse token:", e);
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

    try {
      console.log(`http://192.168.31.183:5280/api/MakeupItems/${id}`);
      const response = await fetch(
        `http://192.168.31.183:5280/api/MakeupItems/${id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        console.log("❌ Error when edit!");
        const errorText = await response.text();
        try {
          const errorJson = JSON.parse(errorText);
          console.error("Error JSON from server:", errorJson);
        } catch (e) {
          console.error("Error format text from server:", errorText);
        }
        throw new Error(`HTTP Error ${response.status}: ${errorText}`);
      }

      setLoading(false);
      setSuccessModalVisible(true);
      router.push("/(root)/(tabs)/makeup-item");
    } catch (error) {
      console.error("🚨 Error Fetch:", error);
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
              <Text style={styles.text}>🔄 Change camera</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.buttonTakePicture}
              onPress={takePicture}
            >
              <Text style={styles.text}>📸 Take a picture</Text>
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
              {errors.name && (
                <Text style={styles.errorText}>{errors.name}</Text>
              )}

              <Text style={styles.title}>Date of Manufacture</Text>
              <TextInput
                pointerEvents="none"
                style={[
                  styles.enableInput,
                  errors.manufactureDate ? styles.inputError : null,
                ]}
                placeholder="DD/MM/YYYY HH:mm"
                value={manufactureDate}
                keyboardType="number-pad"
                maxLength={16}
                editable={false}
                selectTextOnFocus={false}
              />

              <Text style={styles.title}>Expiration Date</Text>
              <TextInput
                pointerEvents="none"
                style={[
                  styles.enableInput,
                  errors.expirationDate ? styles.inputError : null,
                ]}
                placeholder="DD/MM/YYYY HH:mm"
                value={expirationDate}
                keyboardType="number-pad"
                maxLength={16}
                editable={false}
                selectTextOnFocus={false}
              />
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
              {errors.description && (
                <Text style={styles.errorText}>{errors.description}</Text>
              )}

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
              {errors.guidance && (
                <Text style={styles.errorText}>{errors.guidance}</Text>
              )}
              {loading ? (
                <ActivityIndicator size="large" color="#0000ff" />
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
              onPress={handleEditMakeupItem}
            >
              <Text style={styles.buttonText}>Submit</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <Modal visible={successModalVisible} animationType="fade" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.text}>Edit successfully!</Text>
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
    fontWeight: "bold",
    color: "black",
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
    fontSize: 18,
    color: "black",
  },
  enableInput: {
    width: 330,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginBottom: 20,
    backgroundColor: "white",
    fontFamily: "PlayfairDisplay-Bold",
    fontSize: 18,
    color: "gray",
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
    borderRadius: 5,
    marginVertical: 20,
    width: 200,
    fontSize: 18,
    fontWeight: "bold",
    fontFamily: "PlayfairDisplay-Bold",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
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
});
