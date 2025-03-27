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
import { AntDesign, FontAwesome } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import Avatar from "@/components/avatar";
import * as FileSystem from "expo-file-system";
import { Asset } from "expo-asset";
import { Svg, Polygon } from "react-native-svg";
import ModelAddMakeupStyle from "@/components/model-add-makeupstyle";
import { Provider as PaperProvider } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MakeupItem from "./(tabs)/makeup-item";

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
      `Vietnamese people typically have distinctive facial features, including warm or neutral-toned skin, which can lean towards either warm or cool undertones depending on the individual. Their skin is usually thin, with small pores but prone to pigmentation due to environmental factors. Common face shapes include oval or round, with moderately high cheekbones. Vietnamese eyes are often elongated, with monolids or hooded lids, and slightly downturned outer corners. Their eyebrows are naturally shaped, not too thick, and tend to be lighter in color. The nose bridge is generally not very high, with a slightly rounded tip, while the lips are moderately full with soft, natural contours, unlike the sharper lip shapes often seen in Western features.
Based on these characteristics, a bridal-inspired makeup look for Vietnamese features should focus on enhancing natural beauty while maintaining a soft, elegant appearance. The foundation should be lightweight with a natural, dewy finish to keep the skin looking fresh and radiant. Eyebrows should be groomed and shaped naturally without overly sharp lines. For eye makeup, soft and subtle shades work best, without overly emphasizing the crease to maintain harmony with the natural eye shape. A thin eyeliner application can add depth without overpowering the delicate features. Blush and lipstick has a deep brick brown colorshades such as warm peach, soft pink, or rosy red complement Asian skin tones, giving the face a vibrant yet natural glow. Apply the following makeup to me with the user request: ${textPrompt} ${imageDescription}, using the makeup products I have here: ${itemName}, with the description: ${itemDescription}, and guidance: ${itemGuidance}.`
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
          "http://18.142.0.155:5001/api/combined/generate-and-inpaint",
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
          {generatedImage.length > 0 &&
            generatedImage.map((image, index) => (
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={input[index] || ""}
                  editable={false}
                />
              </View>
            ))}
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
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
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
