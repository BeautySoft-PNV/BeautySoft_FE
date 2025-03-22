import React, { useEffect, useState, useRef } from "react";
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
  Modal,
  Pressable,
  Dimensions,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import Avatar from "@/components/avatar";
import * as FileSystem from "expo-file-system";
import { Asset } from "expo-asset";
import { Svg, Polygon } from "react-native-svg";
import ModelAddMakeupStyle from "@/components/model-add-makeupstyle";
import { Provider as PaperProvider } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Generate() {
  const params = useLocalSearchParams();
  const [imageUri, setImageUri] = useState(params.imageUri || null);
  const [itemName, setItemName] = useState(params.itemName || null);
  const [itemDescription, setItemDescription] = useState(
    params.itemDescription || null
  );
  const [itemGuidance, setItemGuidance] = useState(params.itemGuidance || null);
  const [error, setError] = useState("");
  const [imageDescription, setImageDescription] = useState<string>("");
  const router = useRouter();
  const [generatedImage, setGeneratedImage] = useState<string[]>([]);
  const [generateStep, setGenerateStep] = useState<string[]>([]);
  const [tempInput, setTempInput] = useState(""); // Lưu tạm giá trị input
  const [input, setInput] = useState<string[]>(
    Array.isArray(params.request) ? params.request : [params.request]
  );

  const [loading, setLoading] = useState(false);

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
  }, []);

  useEffect(() => {
    if (imageDescription) {
      generateMakeup();
    }
  }, [imageDescription]);

  const makeupKeywords = [
    "makeup",
    "Make up",
    "make up",
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
    "lips",
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
    if (!tempInput.trim()) {
      setError("Input cannot be empty!");
      return;
    }
    const containsMakeupKeyword = makeupKeywords.some((keyword) =>
      tempInput.toLowerCase().includes(keyword)
    );

    if (!containsMakeupKeyword) {
      setError("Input must be related to makeup!");
      return;
    }
    setError("");
    if (tempInput.trim() !== "") {
      setInput((prev) => [...prev, tempInput]);
      setImageDescription(tempInput);
      setTempInput("");
    }
  };

  const generateMakeup = async () => {
    if (!imageUri) return;
    setLoading(true);
    setError("");
    const formData = new FormData();
    const textPrompt = Array.isArray(params.request)
      ? params.request[0]
      : params.request;
    formData.append(
      "TextPrompt",
      `Apply the following makeup to me with the user request: ${textPrompt} ${imageDescription}, using the makeup products I have here: ${itemName}, with the description: ${itemDescription}, and guidance: ${itemGuidance}. Focus on smooth, radiant skin with a natural glow, well-defined yet soft, straight eyebrows, subtle eyeshadow in warm peach or brown tones, soft pink or coral blush, and naturally tinted lips. Maintain Asian facial features, including almond-shaped brown eyes, a small and softly contoured nose, a gentle jawline, and warm golden or neutral undertones. Ensure a dewy, healthy complexion with a lightweight, hydrating base to enhance radiance. Use a sheer foundation or BB cream to even out skin tone while keeping a fresh, natural look. Apply concealer only where needed. Lightly set with translucent powder to control shine while maintaining soft, natural skin.For the eyes, choose warm, neutral shades like peach, terracotta, or light brown to subtly enhance their appearance. Use a soft, blended gradient technique to create natural depth without harsh lines. Apply a thin, natural eyeliner following the lash line, with a slight upward flick for a subtle lifting effect. Curl the lashes and apply mascara to lengthen and define without clumping.For the eyebrows, maintain a naturally straight or softly arched shape, filling in sparse areas using a brow pencil or powder for a natural look. Apply a peach or soft pink blush to the high points of the cheeks to create a youthful, lifted effect. Use a liquid or cream highlighter on the high points of the face (cheekbones, nose bridge, and cupid’s bow) for a fresh glow.For the lips, use soft pink, coral, or warm nude shades. Apply a gradient lip technique for a natural and youthful effect by concentrating color in the center and blending outward. Finish with a light, glossy tint to keep the lips hydrated and plump.Ensure the makeup remains lightweight and enhances natural beauty without altering distinct Asian facial features. Provide step-by-step instructions, such as Step 1, Step 2, Step 3, and so on, for easy application. Keep the overall look fresh, simple, and effortlessly enhancing the natural elegance of East Asian beauty.`
    );
    try {
      const copyAssetToTemp = async () => {
        try {
          const asset = Asset.fromModule(
            require("../(root)/assets/face_oval_mask.png")
          );
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
        } catch (error) {
          throw error;
        }
      };
      const maskFile = await copyAssetToTemp();
      if (maskFile.uri && !maskFile.uri.includes("/uploads")) {
        const file = {
          uri: maskFile.uri,
          name: maskFile.name,
          type: maskFile.type,
        };

        formData.append("Mask", file as any);
      }

      if (correctedUri && !correctedUri.includes("/uploads")) {
        const imageFile = {
          uri: correctedUri,
          type: "image/jpeg",
          name: `uploaded_${Date.now()}.jpg`,
        };
        formData.append("Image", imageFile as any);
      }
      formData.append("OutputFormat", "webp");
      const token = await AsyncStorage.getItem("token");
      try {
        const responseMain = await fetch(
          "http://192.168.2.155:5280/api/combined/generate-and-inpaint",
          {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
          }
        );
        if (!responseMain.ok) {
          setLoading(false);
          throw responseMain.status;
        } else {
          setLoading(false);
          const data = await responseMain.json();
          setGeneratedImage((prev) => [...prev, data.imageData]);
          setGenerateStep((prev) => [...prev, data.generatedPrompt]);
        }
      } catch (error) {
        throw error;
      } finally {
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
    }
  };

  return (
    <View style={styles.wrapper}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View style={styles.container}>
          <TouchableOpacity
            style={{ marginLeft: "2%", marginBottom: 15 }}
            onPress={() => router.push("/(root)/(tabs)/scan")}
          >
            <FontAwesome name="chevron-left" size={24} color="#ED1E51" />
          </TouchableOpacity>
          <View style={styles.row}>
            <View style={styles.photoAndRequest}>
              <Image source={{ uri: correctedUri }} style={styles.image} />
            </View>
            <View>
              <Avatar />
            </View>
          </View>
        </View>

        <View style={styles.container}>
          <View style={styles.row}>
            <View style={styles.photoAndRequest}>
              {generatedImage.length > 0 &&
                generatedImage.map((image, index) => (
                  <View key={index}>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginBottom: "15%",
                        marginTop: "5%",
                      }}
                    >
                      <Image
                        source={require("../../assets/images/beautysoftlogo.png")}
                        style={styles.chatboxavatar}
                      />
                      <View style={styles.inputWrapper}>
                        <View style={styles.inputContainer}>
                          <TextInput
                            style={styles.input}
                            value={input[index] || ""}
                            editable={false}
                          />
                        </View>
                      </View>
                    </View>

                    <Image source={{ uri: image }} style={styles.image} />
                    <PaperProvider>
                      <View style={{ alignSelf: "flex-end", marginTop: 5 }}>
                        <ModelAddMakeupStyle
                          generatedImage={image}
                          generateStep={generateStep[index] || ""}
                        />
                      </View>
                    </PaperProvider>

                    <Text style={styles.steps}>
                      {generateStep[index] || "No step available"}
                    </Text>
                  </View>
                ))}
              {loading ? (
                <Modal transparent animationType="fade">
                  <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                      <ActivityIndicator size="large" color="white" />
                      <Text style={styles.modalText}>
                        Processing request...
                      </Text>
                    </View>
                  </View>
                </Modal>
              ) : error ? (
                <Text style={styles.errorText}>{error}</Text>
              ) : null}
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.inputContainerFixed}>
        <View style={styles.rowContainer}>
          <TextInput
            style={styles.input}
            placeholder="Input request"
            value={tempInput}
            onChangeText={(text) => {
              setTempInput(text);
              if (text.trim()) setError("");
            }}
          />
          <TouchableOpacity onPress={handleUpload}>
            <FontAwesome
              name="send"
              size={24}
              color="#ED1E51"
              style={styles.iconStyle}
            />
          </TouchableOpacity>
        </View>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </View>
    </View>
  );
}

const { height } = Dimensions.get("window");
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
  wrapper: {
    flex: 1,
    backgroundColor: "white",
    height: height,
  },
  scrollView: {
    flex: 1,
  },
  inputContainerFixed: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "white",
    padding: 10,
    borderTopWidth: 1,
  },

  rowContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  input: {
    flex: 1,
    marginTop: 10,
    marginBottom: 5,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#FFE2E2",
    padding: 10,
    borderRadius: 5,
    backgroundColor: "#FFE2E2",
  },
  chatboxavatar: {
    width: 40,
    height: 40,
    borderRadius: 25,
    marginRight: 10,
  },
  steps: {
    marginTop: 40,
  },
  errorText: {
    color: "red",
    marginTop: 10,
  },
  inputContainer: {
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#FFE2E2",
    borderRadius: 10,
    backgroundColor: "#FFE2E2",
    width: "100%",
    borderTopLeftRadius: 0,
  },
  
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    width: "85%",
    marginBottom: "-8%",
  },
  iconStyle: {
    marginLeft: 10,
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
  buttonConfirm: {
    backgroundColor: "#4CAF50",
    padding: 5,
    borderRadius: 5,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    width: 100,
  },
  buttonText: {
    fontSize: 16,
    color: "white",
    fontFamily: "PlayfairDisplay-Bold",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  modalContent: {
    width: 200,
    padding: 20,
    backgroundColor: "#ED1E51",
    borderRadius: 10,
    alignItems: "center",
  },
  modalText: {
    marginTop: 10,
    color: "white",
    fontFamily: "PlayfairDisplay-Bold",
  },
});
