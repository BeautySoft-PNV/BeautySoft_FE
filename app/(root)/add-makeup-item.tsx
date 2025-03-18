import { CameraView, useCameraPermissions } from "expo-camera";
import React, { useState, useRef } from "react";
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
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

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
  const formatDateTime = (text) => {
    let numbersOnly = text.replace(/\D/g, ""); // Chỉ lấy số

    let formatted = numbersOnly
      .replace(/^(\d{2})(\d{0,2})/, "$1/$2") // Thêm dấu `/` sau ngày
      .replace(/^(\d{2}\/\d{2})(\d{0,4})/, "$1/$2") // Thêm dấu `/` sau tháng
      .replace(/^(\d{2}\/\d{2}\/\d{4})(\d{0,2})/, "$1 $2") // Thêm dấu ` ` sau năm
      .replace(/^(\d{2}\/\d{2}\/\d{4} \d{2})(\d{0,2})/, "$1:$2"); // Thêm dấu `:` sau giờ

    return formatted.trim(); // Xóa khoảng trắng dư thừa
  };

  const validateDateTime = (text) => {
    const parts = text.match(/(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2})/);
    if (!parts) return "Sai định dạng";

    let [_, day, month, year, hour, minute] = parts.map(Number);
    if (day < 1 || day > 31) return "Ngày không hợp lệ";
    if (month < 1 || month > 12) return "Tháng không hợp lệ";
    if (year < 1900 || year > 2100) return "Năm không hợp lệ";
    if (hour > 23) return "Giờ không hợp lệ";
    if (minute > 59) return "Phút không hợp lệ";

    return "";
  };

  const handleManufactureDateChange = (text) => {
    let formatted = formatDateTime(text);
    setManufactureDate(formatted);
    setError(validateDateTime(formatted));
  };
  const handleExpirationDateChange = (text) => {
    let formatted = formatDateTime(text);
    setExpirationDate(formatted);
    setError(validateDateTime(formatted));
  };

  const handleAddMakeupItem = async () => {
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
    const token = await getToken();
    const formData = new FormData();
    const decodedToken = parseJwt(token);

    if (decodedToken && decodedToken.id) {
      formData.append("UserId", String(decodedToken.id));
    } else {
      console.error("Không tìm thấy userId trong token!");
    }

    function convertToISOFormat(dateString) {
      const [day, month, yearAndTime] = dateString.split("/");
      const [year, time] = yearAndTime.split(" ");
      return `${year}-${month}-${day}T${time}:00`;
    }

    let formattedManufactureDate = convertToISOFormat(manufactureDate);
    let formattedExpirationDate = convertToISOFormat(expirationDate);

    formData.append("Name", name);
    formData.append("Description", description);
    formData.append("imageFile", {
      uri: capturedImage,  
      name: "makeup.jpg",
      type: "image/jpeg"
    });
    formData.append("Guidance", guidance);
    formData.append("DateOfManufacture", formattedManufactureDate);
    formData.append("ExpirationDate", formattedExpirationDate);

    for (let pair of formData.entries()) {
      console.log(pair[0], pair[1]);
    }
    const response = await fetch("http://192.168.148.183:5280/api/MakeupItems", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.log(`HTTP Error ${response.status}: ${errorText}`)
      
      throw new Error(`HTTP Error ${response.status}: ${errorText}`);
    } else {
      console.log("Add successful!");
      setSuccessModalVisible(true);
      router.push("/(root)/(tabs)/makeup-item")
    }
  };

  console.log("capturedImage: ", capturedImage);
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
          {/* Phần hiển thị ảnh */}
          <View style={styles.imageContainer}>
            <Image source={{ uri: capturedImage }} style={styles.preview} />
            <TouchableOpacity
              style={styles.retakeButton}
              onPress={retakePicture}
            >
              <Text style={styles.text}>🔄 ReTake</Text>
            </TouchableOpacity>
          </View>

          {/* Phần nhập thông tin có thể cuộn */}
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
                placeholder="DD/MM/YYYY HH:mm"
                value={manufactureDate}
                onChangeText={handleManufactureDateChange}
                keyboardType="number-pad"
                maxLength={16}
              />
              {error ? <Text style={styles.error}>{error}</Text> : null}

              <Text style={styles.title}>Expiration Date</Text>
              <TextInput
                ref={inputRef}
                style={[styles.input, error ? styles.inputError : null]}
                placeholder="DD/MM/YYYY HH:mm"
                value={expirationDate}
                onChangeText={handleExpirationDateChange}
                keyboardType="number-pad"
                maxLength={16}
              />
              {error ? <Text style={styles.error}>{error}</Text> : null}

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
            </View>
          </ScrollView>
          <View style={styles.buttonSubmit}>
            <TouchableOpacity style={styles.button} onPress={handleAddMakeupItem}>
              <Text style={styles.buttonText}>Submit</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <Modal visible={successModalVisible} animationType="fade" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.text}>Makeup item added successfully!</Text>
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
  uploadImage: {
    marginLeft: 20,
  },
  retakeButton: {
    position: "absolute",
    bottom: 10, // Cách đáy của ảnh 10px
    right: 10, // Cách mép phải của ảnh 10px
    backgroundColor: "#007AFF",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    alignItems: "center",
  },
  iconStyle: {
    marginLeft: 10, // Khoảng cách bên trái
  },
  errorText: {
    color: "red",
    fontSize: 14,
    alignSelf: "flex-start",
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
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
    borderRadius: 15,
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
    alignItems: "center", // Căn giữa theo chiều ngang
    justifyContent: "center", // Căn giữa theo chiều dọc nếu cần
  }
});
