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
  ScrollView,
} from "react-native";


export default function AddMakeupItem(){
  const [facing, setFacing] = useState<"front" | "back">("back");
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView | null>(null);
  
  const [name, setName] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [guidance, setGuidance] = useState("");
  const [manufactureDate, setManufactureDate] = useState(null);
  const [expirationDate, setExpirationDate] = useState(null);
  const [showManufacturePicker, setShowManufacturePicker] = useState(false);
  const [showExpirationPicker, setShowExpirationPicker] = useState(false);
  
  const [imageDescription, setImageDescription] = useState<string>("");

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
    setImageDescription("");
  }

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
            <View style={styles.previewContainer}>
              <View style={styles.imageContainer}>
                <Image source={{ uri: capturedImage }} style={styles.preview} />
                <TouchableOpacity
                    style={styles.retakeButton}
                    onPress={retakePicture}
                >
                  <Text style={styles.text}>🔄 ReTake</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.title}>Name <Text style ={styles.noticed}>*</Text></Text>
                <TextInput
                    style={styles.input}
                    placeholder="Lips..."
                    placeholderTextColor="#C4C4C4"
                    autoCapitalize="none"
                    value={name}
                    onChangeText={(text) => {
                      setName(text);
                      setErrors((prev) => ({ ...prev, name: '' }));
                    }}
                />
                {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}

                <Text style={styles.title}>Description</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Description..."
                    placeholderTextColor="#C4C4C4"
                    autoCapitalize="none"
                    value={description}
                    onChangeText={(text) => {
                      setDescription(text);
                      setErrors((prev) => ({ ...prev, description: '' }));
                    }}
                />
                {errors.description ? <Text style={styles.errorText}>{errors.description}</Text> : null}

                <Text style={styles.title}>Guidance</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Guidance..."
                    placeholderTextColor="#C4C4C4"
                    autoCapitalize="none"
                    value={guidance}
                    onChangeText={(text) => {
                      setGuidance(text);
                      setErrors((prev) => ({ ...prev, guidance: '' }));
                    }}
                />
                {errors.guidance ? <Text style={styles.errorText}>{errors.guidance}</Text> : null}

              </View>
            </View>
        )}
      </View>
  );
}

const pickerSelectStyles = {
  inputIOS: {
    fontSize: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: "#C4C4C4",
    borderRadius: 4,
    color: "black",
  },
  inputAndroid: {
    fontSize: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: "#C4C4C4",
    borderRadius: 4,
    color: "black",
  },
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
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
    color: "white",
  },
  previewContainer: {
    flex: 1,
    alignItems: "center",
    width: "100%",
  },
  imageContainer: {
    flex: 0.8,
    width: "100%",
    alignItems: "center",
    position: "relative",
  },
  preview: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  inputContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: 'white',
  },
  input: {
    width: '100%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 10,
    backgroundColor: 'white',
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: 18,
    color: 'black',
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
    color: 'red',
    fontSize: 14,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'PlayfairDisplay-Bold',
    color: 'black',
    marginBottom: 5,
    alignSelf: 'flex-start',
  },
  noticed: {
    color: "red"
  },
})