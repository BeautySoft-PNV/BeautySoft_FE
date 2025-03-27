import { Tabs } from "expo-router";
import { Image, ImageSourcePropType, Text, View } from "react-native";
import {
  FontAwesome,
  MaterialIcons,
  MaterialCommunityIcons,
  FontAwesome5,
} from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

const TabsLayout = () => {
  const [hasNewNotification, setHasNewNotification] = useState(false);
  useEffect(() => {
    const interval = setInterval(async () => {
      const hasNew = await AsyncStorage.getItem("hasNewNotification");
      setHasNewNotification(hasNew === "true");
    });

    return () => clearInterval(interval);
  }, []);
  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: "white",
          borderTopColor: "#0061FF1A",
          height: 70,
          flexDirection: "row",
          paddingTop: 15,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <FontAwesome
              name="home"
              size={24}
              color={focused ? "#ED1E51" : "#888"}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: "scan",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <FontAwesome
              name="camera-retro"
              size={24}
              color={focused ? "#ED1E51" : "#888"}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="collection"
        options={{
          title: "collection",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <MaterialIcons
              name="collections"
              size={24}
              color={focused ? "#ED1E51" : "#888"}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="makeup-item"
        options={{
          title: "makeup-item",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <MaterialCommunityIcons
              name="lipstick"
              size={24}
              color={focused ? "#ED1E51" : "#888"}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: "Notifications",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <View style={{ position: "relative" }}>
              <FontAwesome5
                name="bell"
                size={24}
                color={focused ? "#ED1E51" : "#888"}
              />
              {hasNewNotification && (
                <View
                  style={{
                    position: "absolute",
                    top: -2,
                    right: -2,
                    width: 10,
                    height: 10,
                    backgroundColor: "red",
                    borderRadius: 5,
                    borderWidth: 1,
                    borderColor: "white",
                  }}
                />
              )}
            </View>
          ),
        }}
        listeners={{
          focus: async () => {
            await AsyncStorage.setItem("hasNewNotification", "false");
            setHasNewNotification(false);
          },
        }}
      />
      ;
    </Tabs>
  );
};

export default TabsLayout;
