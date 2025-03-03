import React from "react";
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from 'expo-router';

const Home = () => {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.safeContainer}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => router.push('/(root)/(auth)/profile')}>
                    <Image
                        source={{ uri: "https://photo.znews.vn/w660/Uploaded/kbd_pilk/2021_05_06/trieu_le_dinh4.jpg" }}
                        style={styles.avatar}
                    />
                </TouchableOpacity>
        </View>
        <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} style={styles.carouselContainer}>
          {[
            require("@/assets/images/banner1.jpg"),
            require("@/assets/images/banner2.jpg"),
            require("@/assets/images/banner3.jpg"),
          ].map((image, index) => (
            <View key={index} style={styles.bannerWrapper}>
              <Image source={image} style={styles.bannerImage} />
              <Text style={styles.newOfferText}>New Offers</Text>
            </View>
          ))}
        </ScrollView>

        <View style={styles.scanContainer}>
          <Image 
            source={{ uri: "https://veridas.com/wp-content/uploads/2025/01/Captura-de-pantalla-2025-01-14-a-las-10.47.58.png.webp" }} 
            style={styles.scanImage} 
          />
          <TouchableOpacity 
            style={styles.scanButton} 
            onPress={() => router.push('/(root)/tabs/scan')}
          >
            <Text style={styles.scanButtonText}>Tap to scan</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.sectionTitle1}>Face Shape Styles</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
          {[
            { id: 1, text: "Style make up for diamond face shape", image: require("@/assets/images/faceShape.png") },
            { id: 2, text: "Style make up for round face shape", image: require("@/assets/images/faceShape2.png") },
            { id: 3, text: "Style make up for rectangle face shape", image: require("@/assets/images/faceShape3.png") },
          ].map((item) => (
            <View key={item.id} style={styles.cardContainer}>
              <View style={styles.textContainer}>
                <Text style={styles.faceText}>{item.text}</Text>
              </View>
              <View style={styles.imageContainer}>
                <Image source={item.image} style={styles.faceImage} />
              </View>
            </View>
          ))}
        </ScrollView>
        <Text style={styles.sectionTitle2}>Favorite Makeup Item Storage</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
          {[
            { id: 1, text: "Douyin style", image: require("@/assets/images/favoriteItem1.png") },
            { id: 2, text: "Eye shadow", image: require("@/assets/images/favoriteItem2.png") },
            { id: 3, text: "Makeup brush", image: require("@/assets/images/favoriteItem3.png") },
          ].map((item) => (
            <View key={item.id} style={styles.itemContainer}>
              <Image source={item.image} style={styles.itemImage} />
              <Text style={styles.itemText}>{item.text}</Text>
            </View>
          ))}
        </ScrollView>

      </ScrollView>
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  safeContainer: { flex: 1, backgroundColor: "#F3F4F6" },
  scrollContainer: { paddingHorizontal: 16, paddingBottom: 20 },
  headerContainer: { flexDirection: "row", justifyContent: "flex-end", alignItems: "center", marginVertical: 10 },
  avatar: { width: 50, height: 50, borderRadius: 25 , marginBottom: 20, marginTop:5},
  bannerWrapper: {
    position: "relative",
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
  carouselContainer: { height: 200, borderRadius: 10, overflow: "hidden", marginBottom: 16 },
  bannerImage: { width: 300, height: 160, resizeMode: "cover", marginRight: 10, borderRadius: 15 },
  scanContainer: { position: "relative", marginTop: 5, backgroundColor: "#F4F0EF"},
  scanImage: { width: "100%", height: 260, borderRadius: 10,},
  scanButton: {
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
    width:130,
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
  scanButtonText: { color: "black", fontSize: 16, fontWeight: "bold", fontFamily: "PlayfairDisplay-Medium"},
  sectionTitle1: {
    fontSize: 18,
    marginTop: 16,
    marginBottom:22,
    fontFamily: "PlayfairDisplay-Bold",
  },
  sectionTitle2: {
    fontSize: 18,
    marginTop: 16,
    marginBottom:22,
    fontFamily: "PlayfairDisplay-Bold",
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
    flex:1,
    paddingRight: 1,
    width:"100%",
    fontFamily: "PlayfairDisplay-Medium",
  },
  imageContainer: {
    flex: 1,
    alignItems: "center",
  },
  faceImage: {
    width: 70,
    height: 90,
    borderRadius: 40
  },
  faceText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    textAlign: "center",
    fontFamily: "PlayfairDisplay-Medium"
  },
  itemContainer: { alignItems: "center", marginRight: 16, width: 120 },
  itemImage: { width: 100, height: 100, borderRadius: 10 },
  itemText: { marginTop: 8, textAlign: "center", fontSize: 14, fontWeight: "500", marginBottom: 70, fontFamily: "PlayfairDisplay-Medium" },
});


export default Home;
