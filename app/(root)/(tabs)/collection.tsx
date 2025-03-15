import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FontAwesome } from "@expo/vector-icons";

interface MakeupStyle {
  id: string;
  name: string;
  description: string;
  time: string;
  steps: string[];
  image: string;
}

const Collection = () => {
  const [makeupStyles, setMakeupStyles] = useState<MakeupStyle[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Thêm state loading
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
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
        if (!token) throw new Error("No authentication token found");
        const response = await fetch(
          "https://a6e2-2401-d800-d560-aa0b-8b3-2fd3-dc84-915c.ngrok-free.app/api/MakeupStyles/user/me",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        if (Array.isArray(data)) {
          setMakeupStyles(data);
        } else {
          console.error("Invalid data format:", data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false); // Khi fetch xong, tắt trạng thái loading
      }
    };

    fetchData();
  }, []);
  console.log("makeupStyles after: ", makeupStyles);

  const handlePress = (style: MakeupStyle) => {
    router.push({
      pathname: "/tabs/collection-details",
      params: { id: style.id },
    });
  };

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#ED1E51" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => router.push("/(root)/(tabs)/home")}>
          <FontAwesome name="chevron-left" size={24} color="#ED1E51" />
        </TouchableOpacity>
        <Text style={styles.title}>Collection</Text>
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.verticalScroll}
      >
        <View style={styles.gridContainer}>
          {makeupStyles.length > 0 ? (
            makeupStyles.map((style) => (
              <TouchableOpacity
                key={style.id}
                style={styles.item}
                onPress={() => handlePress(style)}
              >
                <Image source={{ uri: style.image }} style={styles.image} />
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.noDataText}>No makeup styles available.</Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    alignItems: "center",
    padding: 16,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 40,
  },
  header: {
    paddingVertical: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ED1E51",
    fontFamily: "PlayfairDisplay-Bold",
    marginRight: "30%",
  },
  verticalScroll: {
    backgroundColor: "#d8d8d870",
    borderRadius: 8,
    padding: 16,
    width: "100%",
    marginBottom: 35,
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
    width: "100%",
    height: 150,
    borderRadius: 8,
  },
  noDataText: {
    color: "black",
    textAlign: "center",
    marginTop: 20,
  },
});

export default Collection;
