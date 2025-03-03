import { Tabs } from "expo-router";
import { Image, ImageSourcePropType, Text, View } from "react-native";
import icons from "@/constants/icons";

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
            <TabIcon focused={focused} icon={icons.box} title="" />
          ),
        }}
      />
      <Tabs.Screen
        name="collection"
        options={{
          title: "storage",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={icons.history} title="" />
          ),
        }}
      />
      
    </Tabs>
  );
};

export default TabsLayout;