import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet, Dimensions, Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {FontAwesome5} from "@expo/vector-icons";

const { width } = Dimensions.get("window");

const images = [
  require("@/assets/images/banner1.jpg"),
  require("@/assets/images/banner2.jpg"),
  require("@/assets/images/banner3.jpg"),
];



const Home = () => {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [vip, setVip] = useState(true);
  const scrollViewRef = useRef<ScrollView>(null);
  const currentIndex = useRef(0);
  const [makeupStyles, setMakeupStyles] = useState<Array<{ id: number; image: string; guidance: string ; date: string}>>([]);
  const [items, setItems] = useState<Array<{ id: number; image: string; name: string }>>([]);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const fetchUserProfileHome = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (!token) {
          console.error("No token found!");
          setLoading(false);
          return;
        }

        const response = await fetch(
          "http://192.168.11.183:5280/api/users/me",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const responseData = await response.json();
        await AsyncStorage.setItem("user", JSON.stringify(responseData));
        setUser(responseData);

        const checkVip = await fetch(
          "http://192.168.11.183:5280/api/managerstorage/check-user",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!checkVip.ok) {
          throw new Error("Lỗi khi gọi API");
        }

        const datacheckVip = await checkVip.json();

        setVip(datacheckVip.status);
        if (!response.ok) {
          throw new Error("Failed to fetch user profile");
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };


    fetchUserProfileHome();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (scrollViewRef.current) {
        currentIndex.current = (currentIndex.current + 1) % images.length;
        scrollViewRef.current.scrollTo({ x: currentIndex.current * width, animated: true });
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchMakeupStyles = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          console.error("No token found!");
          setLoading(false);
          return;
        }
        const response = await fetch("http://192.168.48.183:5280/api/MakeupStyles/user/me", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.status === 404) {
          console.warn("No makeup styles found (404)");
          setMakeupStyles([]);
          return;
        }

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        setMakeupStyles(data); 
      } catch (error) {
        console.error("Error fetching makeup styles:", error);
      }
    };

    fetchMakeupStyles();
  }, []);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (!token) {
          return;
        }
        const response = await fetch("http://192.168.48.183:5280/api/MakeupItems/user/me", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (response.status === 404) {
          console.warn("No makeup styles found (404)");
          setMakeupStyles([]);
          return;
        }

        const data = await response.json();
        setItems(data); 
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);
  useEffect(() => {
    Animated.loop(
        Animated.sequence([
          Animated.timing(fadeAnim, {
            toValue: 0.3,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
    ).start();
  }, []);
  return (
    <SafeAreaView style={styles.safeContainer}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.avatarContainer}>
            <TouchableOpacity
              onPress={() => router.push("/(root)/(auth)/profile")}
            >
              <Image
                  source={{ uri: user?.avatar
                        ? user.avatar
                        : "https://photo.znews.vn/w660/Uploaded/kbd_pilk/2021_05_06/trieu_le_dinh4.jpg" }}
                  style={styles.avatar}
              />
            </TouchableOpacity>
            {vip && (
                <FontAwesome5 name="crown" size={14} color="gold" style={styles.crownIcon} />
            )}
          </View>
        </ScrollView>
        <ScrollView
            ref={scrollViewRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            style={styles.carouselContainer}
        >
          {images.map((image, index) => (
              <View key={index} style={[styles.bannerWrapper, { width }]}>
                <Image source={image} style={styles.bannerImage} />
              </View>
          ))}
        </ScrollView>

        <View style={styles.scanContainer}>
          <Image
            source={{ uri: "https://veridas.com/wp-content/uploads/2025/01/Captura-de-pantalla-2025-01-14-a-las-10.47.58.png.webp" }}
            style={styles.scanImage}
          />
          <Animated.View style={[styles.scanButton, { opacity: fadeAnim }]}>
          <TouchableOpacity
            onPress={() => router.push('/scan')}
          >
            <Text style={styles.scanButtonText}>Take photo</Text>
          </TouchableOpacity>
          </Animated.View>
        </View>
        <Text style={styles.sectionTitle1}>Face Shape Styles</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
          {makeupStyles.map((item) => (
              <View key={item.id} style={styles.cardContainer}>
                <View style={styles.textContainer}>
                  <Text style={styles.faceText}>
                    {item.date.replace("T", "\n")}
                  </Text>
                </View>
                <View style={styles.imageContainer}>
                  <Image source={{ uri: `http://192.168.48.183:5280${item.image}` }} style={styles.faceImage} />
                </View>
              </View>
          ))}
        </ScrollView>
        <Text style={styles.sectionTitle2}>Favorite Makeup Item Storage</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
          {items.map((item) => (
              <View key={item.id} style={styles.itemContainer}>
                <Image source={{ uri: `http://192.168.48.183:5280${item.image}` }} style={styles.itemImage} />
                <Text style={styles.itemText}>{item.name}</Text>
              </View>
          ))}
        </ScrollView>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: { flex: 1, backgroundColor: "#F3F4F6", width:'100%'},
  scrollContainer: { paddingHorizontal: 16, paddingBottom: 20, width:'100%' },
  headerContainer: { flexDirection: "row", justifyContent: "flex-end", alignItems: "center", marginVertical: 10 },
  avatar: { width: 50, height: 50, borderRadius: 25 , marginBottom: 20, marginTop:5},
  bannerWrapper: {
    position: "relative",

  },
  bellContainer: {
    position: "relative",
    width: 50,
    height: 40,
  },
  bellIcon: {
    position: "absolute",
    zIndex: 1,
    top:1
  },
  scroll:{
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingVertical: 10,
  },
  newOfferText: {
    position: "absolute",
    right: 15,
    color: "#DC4775",
    fontSize: 22,
    marginTop:6,
    fontFamily: "PlayfairDisplay-Medium",
    fontWeight: "bold",
  },
  avatarContainer: {
    position: "relative",
    right: 10,
  },
  carouselContainer: { height: 200, borderRadius: 10, overflow: "hidden", marginBottom: 16 },
  bannerImage: { width: '91%', height: 160, resizeMode: "cover", marginRight: 10, borderRadius: 15 },
  scanContainer: { position: "relative", marginTop: 0, backgroundColor: "#F4F0EF", width:'100%' ,borderRadius: 10},
  scanImage: { width: "100%", height: 260, borderRadius: 10, marginLeft:8},
  scanButton: {
    position: "absolute",
    bottom: 30,
    alignSelf: "center",
    width:120,
    height: 48,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: "#F4F0EF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    fontFamily: "PlayfairDisplay-Bold",
  },
  scanButtonText: { color: "black", fontSize: 16, fontWeight: "bold",  fontFamily: "PlayfairDisplay-Bold"},
  sectionTitle1: {
    fontSize: 18,
    marginTop: 16,
    marginBottom: 22,
    fontFamily: "PlayfairDisplay-Bold",
  },
  sectionTitle2: {
    fontSize: 18,
    marginTop: 16,
    marginBottom: 22,
    fontFamily: "PlayfairDisplay-Bold",
  },
    crownIcon: {
      position: "absolute",
      top: 3,
      right:-7,
      transform: [{ rotate: "50deg" }],
    },
  horizontalScroll: {
    flexDirection: "row",
    marginBottom: 16,
  },
  cardContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#D9D9D9",
    borderRadius: 10,
    padding: 5,
    marginRight: 10,
    marginLeft: 10,
    width: 240,
    height: 120,
  },
  textContainer: {
    flex: 1,
    paddingRight: 1,
    width: "100%",
    fontFamily: "PlayfairDisplay-Medium",
  },
  imageContainer: {
    flex: 1,
    alignItems: "center",
  },
  faceImage: {
    width: 100,
    height: 100,
    borderRadius: 10
  },
  faceText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    textAlign: "center",
    fontFamily: "PlayfairDisplay-Medium",
  },
  itemContainer: { alignItems: "center", marginRight: 16, width: 120 },
  itemImage: { width: 100, height: 100, borderRadius: 10 },
  itemText: {
    marginTop: 8,
    textAlign: "center",
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 70,
    fontFamily: "PlayfairDisplay-Medium",
  },
});

export default Home;
