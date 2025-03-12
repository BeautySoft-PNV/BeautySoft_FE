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
  Button,
  Modal,
  ScrollView,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import Avatar from "@/components/avatar";
import * as FileSystem from "expo-file-system"; // For native platforms
import { Asset } from "expo-asset";
import { AntDesign } from "@expo/vector-icons";
import { router } from "expo-router";
import { Portal, Dialog } from "react-native-paper";
import ModelAddMakeupStyle from "@/components/model-add-makeupstyle";
import { Provider as PaperProvider } from "react-native-paper";

export default function Generate() {
  const params = useLocalSearchParams();
  const [imageUri, setImageUri] = useState(params.imageUri || null);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [generateStep, setGenerateStep] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [makeupStyle, setMakeupStyle] = useState("");

  useEffect(() => {
    if (params.imageUri) {
      setImageUri(params.imageUri);
    }
  }, [params.imageUri]);

  useEffect(() => {
    if (imageUri) {
      generateMakeup();
    }
  }, [imageUri]);

  const generateMakeup = async () => {
    if (!imageUri) return;
    setLoading(true);
    setError(null);

    let formData = new FormData();

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

    // Kiểm tra FormData trước khi gửi
    for (let pair of formData.entries()) {
      console.log(`📌 ${pair[0]}: ${pair[1]}`);
    }

    formData.append("OutputFormat", "webp");

    try {
      const copyAssetToTemp = async () => {
        try {
          const asset = Asset.fromModule(
            require("../(root)/assets/face_oval_mask.png")
          );
          await asset.downloadAsync();

          let fileUri;

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

            console.log("Image File (Web):", maskFile);
            return { file: maskFile, uri: null };
          } else {
            fileUri = `${FileSystem.cacheDirectory}face_oval_mask.png`;
            await FileSystem.copyAsync({
              from: asset.localUri || asset.uri,
              to: fileUri,
            });

            console.log("File copied to:", fileUri);
            return { file: null, uri: fileUri };
          }
        } catch (error) {
          console.error("Lỗi copy file:", error);
        }
      };

      const { file, uri } = await copyAssetToTemp();

      if (file || uri) {
        if (Platform.OS === "web") {
          formData.append("Mask", file);
        } else {
          formData.append("Mask", {
            uri: uri,
            type: "image/png",
            name: "face_oval_mask.png",
          });
        }
      }

      let fileBlob;

      if (Platform.OS === "web") {
        const response = await fetch(imageUri);
        fileBlob = await response.blob();
      } else {
        const fileInfo = await FileSystem.getInfoAsync(imageUri);
        if (!fileInfo.exists) {
          throw new Error("File does not exist");
        }

        const fileBase64 = await FileSystem.readAsStringAsync(imageUri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        fileBlob = await fetch(`data:image/jpeg;base64,${fileBase64}`).then(
          (res) => res.blob()
        );
      }

      if (imageUri) {
        const response = await fetch(imageUri);
        const blob = await response.blob();
        const contentType = response.headers.get("Content-Type") || "image/png";
        const extension = contentType.split("/")[1] || "jpg";
        const filename = `${Date.now()}.${extension}`;
        const imageFile = new File([blob], filename, {
          type: contentType,
          lastModified: Date.now(),
        });

        formData.append("Image", imageFile);
        console.log("Image: ", imageFile);
      }

      for (let [key, value] of formData.entries()) {
        console.log(key, JSON.stringify(value));
      }

      const response = await fetch(
        "http://192.168.48.183:5280/api/combined/generate-and-inpaint",
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
        throw new Error("Failed to generate image");
      }

      const data = await response.json();
      console.log("Data: ", data);
      if (data && data.imageData) {
        setGeneratedImage(data.imageData);
        setGenerateStep(data.generatedPrompt);
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      setError(error.message);
      console.error("Error generating image:", error);
    }
    setLoading(false);
  };
  const handleConfirm = () => {
    setConfirmVisible(false);
    setModalVisible(false);
    // Add logic to save the makeup style
  };

  return (
    <ScrollView>
      <View style={styles.container}>
        <View style={styles.row}>
          <View style={styles.photoAndRequest}>
            <Image source={{ uri: params.imageUri }} style={styles.image} />
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
                source={require("../../assets/icons/chatbox.jpg")}
                style={styles.chatboxavatar}
              />
            </View>
            <View style={styles.photoAndRequest}>
              {generatedImage && (
                <Image source={{ uri: generatedImage }} style={styles.image} />
              )}
              <PaperProvider>
                <ModelAddMakeupStyle
                  generatedImage={generatedImage}
                  generateStep={generateStep}
                />
              </PaperProvider>
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
});
