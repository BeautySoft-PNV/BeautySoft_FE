import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  ActivityIndicator,
  TextInput,
  Platform,
  Image,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import Avatar from "@/components/avatar";
import * as FileSystem from "expo-file-system"; // For native platforms
import { Asset } from "expo-asset";
import { AntDesign } from "@expo/vector-icons";
import ModelAddMakeupStyle from "@/components/model-add-makeupstyle";
import { Provider as PaperProvider } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Generate() {
  const params = useLocalSearchParams();
  const [imageUri, setImageUri] = useState(params.imageUri || null);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [generateStep, setGenerateStep] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [imageDescription, setImageDescription] = useState<string>("");
  const router = useRouter();

  const correctedUri = (params.imageUri as string)
    .replace(/%40/g, "%2540") // Encode '@' thành '%2540'
    .replace(/%2F/g, "%252F"); // Encode '/' thành '%252F'
  useEffect(() => {
    if (correctedUri) {
      setImageUri(correctedUri);
    }
  }, [correctedUri]);

  useEffect(() => {
    if (imageUri) {
      generateMakeup();
    }
  }, [imageUri]);

  const generateMakeup = async () => {
    if (!imageUri) return;
    setLoading(true);
    setError(null);
    // 🛠️ Tạo FormData và thêm các param bắt buộc
    const formData = new FormData();
    const textPrompt = Array.isArray(params.request)
      ? params.request[0]
      : params.request;
    formData.append(
      "TextPrompt",
      ` ${textPrompt} Apply a soft, natural Asian-style makeup look while preserving my natural facial features. Follow these detailed steps to ensure a professional, elegant, and effortless beauty suitable for everyday wear and special occasions:
Base Makeup (Foundation & Powder): Use a lightweight, hydrating foundation or BB cream that evens out my skin tone while maintaining a natural, dewy glow. Apply a thin layer and blend well for a second-skin effect. Set with a light dusting of finely milled translucent powder, focusing on the T-zone to control shine while keeping the skin luminous.
Eyebrows: Shape and fill my eyebrows with a soft brown or taupe shade, following my natural brow shape. Keep the brows slightly straight or gently arched for a youthful, delicate Asian-inspired look. Avoid overly defined or harsh lines.
Eyeshadow: Apply soft, neutral tones (such as champagne, peach, or light brown) on the eyelids for a subtle, fresh appearance. Blend seamlessly for a natural gradient effect, ensuring the eyes look bright and lively without heavy pigmentation.
Eyeliner & Lashes: Use a fine brown or dark brown eyeliner to create a subtle, natural enhancement to my lash line. Draw a thin line along the upper lash line, slightly extending at the outer corners for a soft lifting effect. Apply a light coat of lengthening mascara or natural-looking curled false lashes to enhance my eyes without looking overly dramatic.
Blush: Sweep a sheer, soft pink or peach blush onto the apples of my cheeks, blending outward toward the temples for a natural flush that mimics a healthy glow. The application should be airy and diffused.
Lips: Choose a soft coral, rosy pink, or MLBB (My Lips But Better) shade for the lips. Apply in a gradient style by focusing color on the center and blending outward for a soft, diffused, youthful effect, or use a sheer tint for a naturally fresh look.
Final Touches (Highlighting & Setting): Apply a subtle liquid or cream highlighter to the high points of my face (cheekbones, nose bridge, and cupid bow) for a soft, natural glow. Finish with a light mist of dewy setting spray to lock in hydration and freshness without making the skin look heavy or overly matte.
Ensure the final look embodies the soft, effortless beauty of Asian-style makeup. The makeup should appear professionally applied, realistic, and perfect for enhancing my natural features without altering my identity.
Create a gentle and refined Asian-inspired makeup look that captures elegance and minimalism while preserving my individuality.
    );`
    );

    try {
      const copyAssetToTemp = async () => {
        try {
          const asset = Asset.fromModule(
            require("../(root)/assets/face_oval_mask.png")
          );

          if (Platform.OS === "web") {
            const response = await fetch(asset.uri);
            const blob = await response.blob();
            const contentType =
              response.headers.get("Content-Type") || "image/png";
            const extension = contentType.split("/")[1] || "png";
            const filename = `face_oval_mask.${extension}`;

            const maskFile = new File([blob], filename, {
              type: contentType,
              lastModified: Date.now(),
            });

            console.log("📌 Mask File (Web):", maskFile);
            return { file: maskFile, uri: null };
          } else {
            await asset.downloadAsync();
            if (!asset.localUri) {
              throw new Error("Tải asset thất bại");
            }

            const fileUri = `${FileSystem.cacheDirectory}face_oval_mask.png`;
            await FileSystem.copyAsync({ from: asset.localUri, to: fileUri });

            // Đọc file dưới dạng Base64
            const base64 = await FileSystem.readAsStringAsync(fileUri, {
              encoding: FileSystem.EncodingType.Base64,
            });

            // Ghi lại file để đảm bảo tồn tại
            const finalFileUri = `${FileSystem.documentDirectory}face_oval_mask.png`;
            await FileSystem.writeAsStringAsync(finalFileUri, base64, {
              encoding: FileSystem.EncodingType.Base64,
            });


            const maskFile = {
              uri: finalFileUri,
              name: "face_oval_mask.png",
              type: "image/png",
            };

            return maskFile;
          }
        } catch (error) {
          console.error("Lỗi copy file:", error);
          throw error;
        }
      };

      const maskFile = await copyAssetToTemp();

      formData.append("Mask", {
        uri: maskFile.uri, // Đường dẫn file hợp lệ
        name: maskFile.name, // Tên file
        type: maskFile.type, // Loại MIME type
      });

      let imageFile;
      if (Platform.OS === "web") {
        const response = await fetch(imageUri);
        const blob = await response.blob();
        const contentType =
          response.headers.get("Content-Type") || "image/jpeg";
        const extension = contentType.split("/")[1] || "jpg";
        const filename = `uploaded_${Date.now()}.${extension}`;
        imageFile = new File([blob], filename, {
          type: contentType,
          lastModified: Date.now(),
        });
      } else {
        imageFile = {
          uri: correctedUri,
          type: "image/jpeg",
          name: `uploaded_${Date.now()}.jpg`,
        };
      }

      formData.append("Image", imageFile);
      formData.append("OutputFormat", "webp"); // ✅ Thêm OutputFormat

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
      const token = await getToken();

      const response = await fetch(
        "http://192.168.48.183:5280/api/combined/generate-and-inpaint",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );
      if (!response.ok) {
        const errorText = await response.text(); // Lấy nội dung lỗi
        throw new Error(`HTTP Error ${response.status}: ${errorText}`);
      } else {
        console.log("Generate successfullly: ", response.data);
      }
    } catch (error) {
      console.error("⚠️ Error generating image:", error);
    }
    setLoading(false);
  };

  const handleConfirm = () => {
    setConfirmVisible(false);
    setModalVisible(false);
  };
  return (
    <ScrollView style={styles.scrollView}>
      <TouchableOpacity onPress={() => router.push("/(root)/(tabs)/scan")}>
        <FontAwesome name="chevron-left" size={24} color="#ED1E51" />
      </TouchableOpacity>
      <View style={styles.container}>
        <View style={styles.row}>
          <View style={styles.photoAndRequest}>
            <Image
              source={{
                uri: correctedUri,
              }}
              style={styles.image}
            />

            <TextInput
              style={styles.input}
              value={
                Array.isArray(params.request)
                  ? params.request[0]
                  : params.request
              }
              editable={false}
            />
          </View>
          <View>
            <Avatar />
          </View>
        </View>

        <View style={styles.container}>
          <View style={styles.row}>
            <View>
              <Image
                source={require("../../assets/images/beautysoftlogo.png")}
                style={styles.chatboxavatar}
              />
            </View>
            <View style={styles.photoAndRequest}>
              {generatedImage && (
                <Image source={{ uri: generatedImage }} style={styles.image} />
              )}
              {loading ? (
                <ActivityIndicator size="large" color="#0000ff" />
              ) : error ? (
                <Text style={styles.errorText}>{error}</Text>
              ) : (
                <PaperProvider>
                  <ModelAddMakeupStyle
                    generatedImage={generatedImage}
                    generateStep={generateStep}
                  />
                </PaperProvider>
              )}
              <Text style={styles.steps}>{generateStep}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Input request */}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Input request"
          value={imageDescription}
          onChangeText={setImageDescription}
        />
        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: "/generate",
              params: {
                imageUri: imageUri,
                request: imageDescription,
              },
            })
          }
        >
          <AntDesign
            name="upload"
            size={24}
            color="black"
            style={styles.iconStyle}
          />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: "#fff",
    paddingTop: 10,
    paddingHorizontal: 8,
  },
  container: {
    backgroundColor: "#fff",
    padding: 10,
  },
  row: {
    flexDirection: "row",
    padding: 5,
  },
  photoAndRequest: {
    flex: 4,
    backgroundColor: "#fff",
    borderRadius: 10,
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    resizeMode: "cover",
  },
  input: {
    flex: 1,
    marginTop: 10,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    backgroundColor: "white",
  },
  chatboxavatar: {
    width: 40,
    height: 40,
    borderRadius: 25,
    marginRight: 10,
  },
  steps: {
    marginTop: 10,
  },
  errorText: {
    color: "red",
    marginTop: 10,
  },
  inputContainer: {
    position: "absolute", // Cố định vị trí
    bottom: -300, // Điều chỉnh khoảng cách đến tab (tùy chỉnh số này)
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    paddingHorizontal: 10,
    borderRadius: 5,
    backgroundColor: "white",
    width: "100%",
    paddingVertical: 10, // Thêm padding dọc nếu cần
  },

  iconStyle: {
    marginLeft: 10, // Khoảng cách bên trái
  },
});
