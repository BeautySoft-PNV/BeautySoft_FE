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
    // Các sản phẩm trang điểm nền
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

    // Trang điểm mắt
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

    // Trang điểm má
    "blush",
    "bronzer",
    "contour",
    "highlighter",
    "cheek tint",
    "cream blush",
    "powder blush",
    "liquid blush",

    // Trang điểm môi
    "lipstick",
    "lip gloss",
    "lip tint",
    "lip liner",
    "lip balm",
    "matte lipstick",
    "lip plumper",
    "lip stain",

    // Các kỹ thuật trang điểm
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
      `Apply the following makeup to me with the user request: ${textPrompt} ${imageDescription}, using the makeup products I have here: ${itemName}, with the description: ${itemDescription}, and guidance: ${itemGuidance}. Apply a natural and light makeup look tailored for Asian facial features. Focus on a dewy, healthy skin finish with a lightweight, hydrating base that enhances natural radiance. Use a sheer foundation or BB cream to even out skin tone while maintaining a fresh, glowing complexion. Apply a minimal amount of concealer only where needed. Set with a fine, translucent powder to control shine but keep the skin looking soft and natural.

For the eyes, use soft, neutral shades like peach or warm brown to enhance the natural eye shape subtly. Avoid heavy contouring; instead, use a soft, gradient eyeshadow blending technique. Apply a thin, natural eyeliner that follows the eye’s shape closely, with a slight upward flick to create a subtle lifting effect. Curl the lashes and use a lengthening mascara for a fluttery, defined look without clumping.

For the brows, keep them softly arched and filled in with light strokes to mimic natural hair. Use a subtle peach or pink blush applied high on the cheeks to give a youthful, lifted effect. Apply a liquid or cream highlighter sparingly on the high points of the face for a fresh glow.

For the lips, choose a soft, natural pink or coral shade. Use a gradient lip technique for a youthful and effortless effect, applying more color in the center and blending outwards. Finish with a light, glossy tint for a hydrated and plump look.

Ensure the makeup enhances natural Asian features without looking heavy, maintaining a soft, fresh, and effortless appearance. Provide specific steps for each stage, such as Step 1, Step 2, Step 3, and so on. Apply a natural and light makeup look without altering my facial features or hairstyle. Focus only on face makeup with a fresh, minimal, and natural foundation. Start with a light, hydrating primer to create a smooth base and prolong the wear of the makeup. Use a thin, skin-like foundation that evens out my skin tone while maintaining a natural look, blending it well for a lightweight finish. Apply a light-coverage concealer only where needed (under the eyes, redness, or blemishes) and blend lightly for a natural effect. Lightly dust translucent powder to prevent shine while keeping my skin looking fresh. Add a natural, peachy blush to the apples of my cheeks for a healthy-looking glow. Apply a thin layer of liquid or cream highlighter to the high points of my face (cheekbones, bridge of the nose) for a fresh look. Lightly fill in sparse areas of my brows with a natural brow pencil or loose powder, keeping the look soft and fluffy. Use a neutral matte or shimmer eyeshadow to enhance my natural, soft look. Apply a thin layer of brown or black mascara to subtly define my lashes without clumping. Finish with a tint or a clear, hydrating lip balm in a natural shade to accentuate my lip color. Ensure that my makeup enhances my natural features without looking heavy or overly defined, maintaining my skin texture and keeping the overall look fresh and effortless.`
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

      if (maskFile.uri && !maskFile.uri.includes("/uploads")) {
        const file = {
          uri: maskFile.uri,
          name: maskFile.name,
          type: maskFile.type,
        };

        formData.append("Mask", file as any);
      }

      let imageFile;
      if (Platform.OS === "web") {
        const imageUrl = Array.isArray(imageUri) ? imageUri[0] : imageUri;
        const response = await fetch(imageUrl);
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
        if (correctedUri && !correctedUri.includes("/uploads")) {
          const imageFile = {
            uri: correctedUri,
            type: "image/jpeg",
            name: `uploaded_${Date.now()}.jpg`,
          };
          formData.append("Image", imageFile as any);
        }
      }

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
      console.log("token: ", token);

      try {
        const responseMain = await fetch(
          "http://192.168.31.183:5280/api/combined/generate-and-inpaint",
          {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
          }
        );
        if (!responseMain.ok) {
          throw new Error(
            `HTTP Error ${responseMain.status}: ${await responseMain.text()}`
          );
        } else {
          const data = await responseMain.json();
          console.log("generatedPrompt: ", data.generatedPrompt);
          setGeneratedImage((prev) => [...prev, data.imageData]);
          setGenerateStep((prev) => [...prev, data.generatedPrompt]);
        }
      } catch (error) {
        console.error("⚠️ Lỗi khi gọi API Main:", error);
      } finally {
        setLoading(false);
      }
    } catch (error) {
      console.error("⚠️ Lỗi tổng thể khi generate image:", error);
      setLoading(false);
    }
  };

  return (
    <View style={styles.wrapper}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <TouchableOpacity
          style={{ marginLeft: "10%" }}
          onPress={() => router.push("/(root)/(tabs)/scan")}
        >
          <FontAwesome name="chevron-left" size={24} color="#ED1E51" />
        </TouchableOpacity>

        <View style={styles.container}>
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
            <View>
              <Image
                source={require("../../assets/images/beautysoftlogo.png")}
                style={styles.chatboxavatar}
              />
            </View>
            <View style={styles.photoAndRequest}>
              {generatedImage.length > 0 &&
                generatedImage.map((image, index) => (
                  <View key={index}>
                    <TextInput
                      style={styles.input}
                      value={input[index] || ""}
                      editable={false}
                    />
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
                <ActivityIndicator size="large" color="#0000ff" />
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
  wrapper: {
    flex: 1,
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
    borderColor: "#ccc",
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
    marginTop: 40,
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
