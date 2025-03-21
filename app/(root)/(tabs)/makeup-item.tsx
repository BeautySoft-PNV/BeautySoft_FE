import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AntDesign, FontAwesome } from "@expo/vector-icons";
import { MD2Colors, TextInput } from "react-native-paper";

const whiteColor = MD2Colors.white;

interface MakeupItem {
  id: string;
  name: string;
  time: string;
  description: string;
  image: string;
  guidance: string;
  dateOfManufacture: string;
  expirationDate: string;
}
const MakeupItem = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [makeupItems, setMakeupItems] = useState<MakeupItem[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await AsyncStorage.getItem("token");

        if (!token) throw new Error("No authentication token found");

        const response = await fetch(
          "http://192.168.68.102:5280/api/MakeupItems/user/me",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          if (response.status === 404) {
            return null;
          }
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        if (Array.isArray(data)) {
          setMakeupItems(data);
        } else {
          console.error("Invalid data format ", data);
        }
      } catch (error) {
        console.error("Error fetching data: ", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  const handlePress = (makeupItem: MakeupItem) => {
    router.push({
      pathname: "/tabs/item-detail",
      params: { id: makeupItem.id },
    });
  };
  const filteredItems = makeupItems.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.buttonField}>
        <View style={styles.container}>
          <Text style={styles.title}>Item Storage</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push("/add-makeup-item")}
          >
            <Text style={styles.text}>
              ADD <AntDesign name="plus" size={20} />
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.inputField}>
          <TextInput
              style={[styles.input, { fontFamily: "PlayfairDisplay-Bold" }]}
            placeholder="Search Item"
            placeholderTextColor={whiteColor}
            textColor="white"
            value={searchQuery}
            onChangeText={setSearchQuery}
            theme={{ colors: { primary: "white" } }}
            underlineStyle={{ display: "none" }}
          />
        </View>
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.verticalScroll}
      >
        <View style={styles.gridContainer}>
          {filteredItems.length > 0 ? (
            filteredItems.map((makeupItem) => (
              <TouchableOpacity
                key={makeupItem.id}
                style={styles.item}
                onPress={() => handlePress(makeupItem)}
              >
                <Image
                  source={{ uri: makeupItem.image }}
                  style={styles.image}
                />
                <Text style={styles.name}>{makeupItem?.name}</Text>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <FontAwesome name="check-circle" size={50} color="green" />
              <Text style={styles.emptyText}>
                No make up item!
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  scrollContainer: { paddingHorizontal: 16, paddingBottom: 20 },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginVertical: 10,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: 50,
    marginTop: 5,
  },
  button: {
    padding: 12,
    backgroundColor: "#ED1E51",
    borderRadius: 5,
  },
  text: {
    fontSize: 16,
    fontFamily: "PlayfairDisplay-Bold",

    color: "white",
  },
  title: {
    fontSize: 25,
    color: "black",
    fontFamily: "PlayfairDisplay-Bold",
  },
  name: {
    fontSize: 16,
    color: "black",
    fontFamily: "PlayfairDisplay-Bold",
  },
  scroll: {
    display: "flex",
    alignItems: "flex-end",
  },
  buttonField: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  scrollItem: {
    paddingBottom: 20,
    marginTop: 10,
  },
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 1,
    marginTop: 20,
  },
  inputField: {
    marginTop: 17,
    padding: 0,
    backgroundColor: "#ED1E51",
    borderRadius: 10,
    borderBottomWidth: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  input: {
    fontSize: 16,
    fontFamily: "PlayfairDisplay-Bold",
    backgroundColor: "#ED1E51",
    color: whiteColor,
  },
  avatarContainer: {
    position: "relative",
    right: 0,
  },
  crownIcon: {
    position: "absolute",
    top: 3,
    left: -10,
    transform: [{ rotate: "-50deg" }],
  },
  containerItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 30,
    marginBottom: 30,
  },

  imageItem: {
    width: 127,
    height: 127,
    borderRadius: 16,
  },
  textItem: {
    marginTop: 10,
  },

  verticalScroll: {
    backgroundColor: "#d8d8d870",
    borderRadius: 8,
    padding: 16,
    width: "100%",
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  item: {
    width: "48%",
    alignItems: "center",
    marginBottom: 16,
  },
  image: {
    width: "80%",
    height: 120,
    borderRadius: 8,
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: 50,
  },
  emptyText: {
    fontSize: 20,
    fontFamily: "PlayfairDisplay-Bold",
    color: "black",
    marginTop: 10,
  },
});

export default MakeupItem;
