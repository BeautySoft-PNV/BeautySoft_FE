import { View, Image, StyleSheet, Text } from "react-native";
import { useLocalSearchParams } from "expo-router";
import Avatar from "@/components/avatar";
import MakeupGenerate from "@/components/makeup-generate";
import { TextInput } from "react-native-gesture-handler";
import { ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import * as FileSystem from "expo-file-system";
import { useEffect, useState } from "react";

export default function Generate() {
  const params = useLocalSearchParams();
  console.log(params.imageUri);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <View style={styles.container}>
            <View style={styles.row}>
              <View style={styles.photoAndRequest}>
                <Image source={{ uri: params.imageUri }} style={styles.image} />
                <TextInput
                  style={styles.input}
                  value={params.request}
                  editable={false}
                />
              </View>
              <View>
                <Avatar />
              </View>
            </View>
            <MakeupGenerate />
          </View>
        </KeyboardAvoidingView>
      </ScrollView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    padding: 10,
  },
  scrollContainer: {
    flexGrow: 1, // Giúp nội dung cuộn mượt
    paddingBottom: 20, // Tạo khoảng trống ở cuối
  },
  row: {
    flexDirection: "row", // Sắp xếp avatar và ảnh trên cùng một hàng ngang
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
});
