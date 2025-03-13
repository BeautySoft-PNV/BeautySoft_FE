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
import * as FileSystem from "expo-file-system";
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
    .replace(/%40/g, "%2540")
    .replace(/%2F/g, "%252F"); 
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
    const formData = new FormData();
    const textPrompt = Array.isArray(params.request)
      ? params.request[0]
      : params.request;
    formData.append(
      "TextPrompt",
      ` ${textPrompt} For a soft, natural Asian-style makeup look, start with a lightweight, hydrating foundation or BB cream for an even, dewy finish, setting lightly with translucent powder on the T-zone to control shine. Shape and fill your eyebrows with a soft brown or taupe shade, keeping them slightly straight or gently arched for a youthful effect. Apply soft neutral eyeshadows like champagne, peach, or light brown for a fresh, bright appearance, blending seamlessly. Use fine brown eyeliner along the upper lash line, subtly extending the outer corners, and finish with lengthening mascara or natural false lashes. Sweep a sheer pink or peach blush on the apples of your cheeks, blending outward for a healthy glow. For the lips, choose a soft coral, rosy pink, or MLBB shade, applying in a gradient for a fresh, youthful effect. Complete the look with a subtle highlight on the high points of your face and a dewy setting mist for a luminous, natural finish that enhances your beauty with elegance and minimalism..
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


            const base64 = await FileSystem.readAsStringAsync(fileUri, {
              encoding: FileSystem.EncodingType.Base64,
            });


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
        uri: maskFile.uri,
        name: maskFile.name, 
        type: maskFile.type, 
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
      formData.append("OutputFormat", "webp"); 

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
        "http://192.168.11.183:5280/api/combined/generate-and-inpaint",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );
      if (!response.ok) {
        const errorText = await response.text(); 
        throw new Error(`HTTP Error ${response.status}: ${errorText}`);
      } else {
        const data = await response.json();
        setGeneratedImage(data.imageData);
        setGenerateStep(data.generatedPrompt);
        console.log("data.generatedPrompt: ", data.generatedPrompt)
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
    position: "absolute",
    bottom: -300, 
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
    paddingVertical: 10, 
  },

  iconStyle: {
    marginLeft: 10, 
  },
});