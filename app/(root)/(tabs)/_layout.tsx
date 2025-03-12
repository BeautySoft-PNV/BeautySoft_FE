import { Tabs } from "expo-router";
import { Image, ImageSourcePropType, Text, View } from "react-native";
import icons from "@/constants/icons";
import history from "@/assets/icons/history.png";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {useEffect, useState} from "react";

const TabIcon = ({
  focused,
  icon,
  title,
}: {
  focused: boolean;
  icon: ImageSourcePropType;
  title: string;
}) => (
  <View className="flex-1 mt-3 flex flex-col items-center">
    <Image
      source={icon}
      tintColor={focused ? "#3CC18E" : "#777B84"}
      resizeMode="contain"
      className="size-7"
    />
    <Text
      className={`${
        focused
          ? "text-primary font-inter-semibold"
          : "text-neutral-400 font-medium"
      } text-xs w-full text-center mt-1`}
    >
      {title}
    </Text>
  </View>
);

const TabsLayout = () => {
    const [hasNewNotification, setHasNewNotification] = useState(false);
    useEffect(() => {
        const interval = setInterval(async () => {
            const hasNew = await AsyncStorage.getItem('hasNewNotification');
            setHasNewNotification(hasNew === 'true');
        });

        return () => clearInterval(interval);
    }, []);
  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: "white",
          position: "absolute",
          borderTopColor: "#0061FF1A",
          borderTopWidth: 1,
          minHeight: 70,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={icons.home} title="" />
          ),
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: "Storage",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={icons.scan} title="" />
          ),
        }}
      />
      <Tabs.Screen
        name="collection"
        options={{
          title: "storage",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={icons.box} title="" />
          ),
        }}
      />
        <Tabs.Screen
            name="notifications"
            options={{
                title: "notifications",
                headerShown: false,
                tabBarIcon: ({ focused }) => (
                    <View>
                        <TabIcon focused={focused} icon={icons.history} title="" />
                        {hasNewNotification && (
                            <View style={{
                                position: 'absolute',
                                top: 5,
                                right: 0,
                                width: 10,
                                height: 10,
                                backgroundColor: 'red',
                                borderRadius: 5
                            }} />
                        )}
                    </View>
                ),
            }}
            listeners={{
                focus: async () => {
                    await AsyncStorage.setItem('hasNewNotification', 'false');
                    setHasNewNotification(false);
                }
            }}
        />
    </Tabs>
  );
};

export default TabsLayout;