import { CameraView, useCameraPermissions } from "expo-camera";
import { useState, useRef, useEffect } from "react";
import {
  Button,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  TextInput,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { AntDesign } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Scan() {
  const [facing, setFacing] = useState<"front" | "back">("back");
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [imageDescription, setImageDescription] = useState<string>("");
  const [error, setError] = useState("");
  const [items, setItems] = useState<
    Array<{
      id: number;
      image: string;
      name: string;
      description: string;
      guidance: string;
    }>
  >([]);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getMakeupItems();
      setItems(data);
    };

    fetchData();
  }, []);

  const makeupKeywords = [
    "Make up",
    "make up",
    "makeup",
    "foundation",
    "concealer",
    "primer",
    "setting spray",
    "powder",
    "compact",
    "loose powder",
    "bb cream",
    "cc cream",
    "tinted moisturizer",
    "eyeshadow",
    "mascara",
    "eyeliner",
    "brow",
    "brow pencil",
    "brow gel",
    "kajal",
    "lash",
    "lash curler",
    "eye primer",
    "glitter shadow",
    "cut crease",
    "smokey eye",
    "blush",
    "bronzer",
    "contour",
    "highlighter",
    "cheek tint",
    "cream blush",
    "powder blush",
    "liquid blush",
    "lipstick",
    "lip gloss",
    "lip tint",
    "lip liner",
    "lip balm",
    "matte lipstick",
    "lip plumper",
    "lip stain",
    "baking",
    "strobing",
    "highlighting",
    "contouring",
    "color correcting",
    "blending",
    "overlining",
    "cut crease",
    "ombre lips",
    "dewy finish",
    "matte finish",
    "full glam",
    "natural makeup",
    "no-makeup makeup",
  ];
  const handleUpload = () => {
    if (!imageDescription.trim()) {
      setError("Input cannot be empty!");
      return;
    }
    const containsMakeupKeyword = makeupKeywords.some((keyword) =>
      imageDescription.toLowerCase().includes(keyword)
    );

    if (!containsMakeupKeyword) {
      setError("Input must be related to makeup!");
      return;
    }
    setError("");

    router.push({
      pathname: "/generate",
      params: {
        imageUri: capturedImage,
        request: imageDescription,
        itemName: items.map((item) => item.name),
        itemDescription: items.map((item) => item.description),
        itemGuidance: items.map((item) => item.guidance),
      },
    });
  };

  const getMakeupItems = async () => {
    const token = await AsyncStorage.getItem("token");
    try {
      const response = await fetch(
        "http://192.168.31.183:5280/api/MakeupItems/user/me",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        console.warn("Error fetching makeup items");
        return [];
      }
      const data = await response.json();
      return data.map((item: any) => ({
        name: item.name,
        description: item.description,
        guidance: item.guidance,
      }));
    } catch (error) {
      console.error("Error:", error);
      return [];
    }
  };

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
            <View style={styles.rowContainer}>
              <TextInput
                style={styles.input}
                placeholder="Input request"
                value={imageDescription}
                onChangeText={(text) => {
                  setImageDescription(text);
                  if (text.trim()) setError("");
                }}
              />
              <TouchableOpacity onPress={handleUpload}>
                <AntDesign
                  name="upload"
                  size={24}
                  color="black"
                  style={styles.iconStyle}
                />
              </TouchableOpacity>
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </View>
        </View>
      )}
    </View>
  );
}

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
    flex: 0.2,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    backgroundColor: "white",
    width: "100%",
    paddingHorizontal: 10,
    paddingVertical: 5,
    paddingTop: 20,
    marginBottom: 30,
  },
  rowContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    paddingHorizontal: 10,
    borderRadius: 5,
    backgroundColor: "white",
  },
  errorText: {
    color: "red",
    marginTop: 5,
    textAlign: "left",
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
    marginLeft: 10, // Khoảng cách bên trái
  },
});
