import { View, Image, StyleSheet, Text, TouchableOpacity } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { AntDesign } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";

export default function MakeupGenerate() {
  const params = useLocalSearchParams();
  const router = useRouter(); // Dùng useRouter thay vì navigation
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View>
          <Image
            source={require("../assets/icons/chatbox.png")}
            style={styles.chatboxavatar}
          />
        </View>
        <View style={styles.photoAndRequest}>
          <Image source={{ uri: params.imageUri }} style={styles.image} />
          <Text style={styles.steps}>
            Vietnamese Bridal Makeup Steps{"\n"}
            {"\n"}
            Prep Skin – Cleanse, moisturize, and apply primer.{"\n"}
            Flawless Base – Use full-coverage foundation and concealer.
            {"\n"}
            Natural Brows – Shape and fill softly.{"\n"}
            Elegant Eyes – Apply neutral eyeshadow, eyeliner, and mascara.
            {"\n"}
            Soft Contour & Blush – Lightly contour and add rosy blush.{"\n"}
            Bold Lips – Use red, coral, or rose pink lipstick.{"\n"}
            Set & Glow – Apply setting powder/mist and highlighter.
          </Text>

          <TouchableOpacity onPress={() => router.push("/storage-box")}>
            <AntDesign name="save" size={24} color="black" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    paddingTop: 15,
    padding: 5,
  },
  row: {
    flexDirection: "row", // Sắp xếp avatar và ảnh trên cùng một hàng ngang
  },
  chatboxavatar: {
    width: 40,
    height: 40,
    borderRadius: 25,
    marginRight: 10,
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
  steps: {
    marginTop: 10,
  },
});
