import { View, Text, Button, FlatList } from "react-native";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useStore } from "@/store";
import { fetchUsers, deleteUser, addUser } from "@/services/userService";
import { queryClient } from "@/libs/tanstackQuery";

const Home = () => {
  // example about zustand
  const { count, increment, decrement, user, updateUser } = useStore();
  const updateName = () => {
    updateUser({ ...user, name: "Jane" });
  };

  // example about react-query and axios

  const { data: users, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
    staleTime: 1000,
  });
  console.log(users);

  const addUserMutation = useMutation({
    mutationFn: addUser,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["users"],
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["users"],
      });
    },
  });
  return (
    <SafeAreaProvider>
      <SafeAreaView className="flex-1">
        <View>
          <Text>Home</Text>

          {/* example about zustand */}
          <Text>{count}</Text>
          <Button title="+" onPress={increment} />
          <Button title="-" onPress={decrement} />

          <Text>{user.name}</Text>
          <Text>{user.age}</Text>
          <Button title="Update Name" onPress={updateName} />

          {/* example about react-query and axios */}
          <View className="mt-4">
            <Button
              title="Add User"
              onPress={() =>
                addUserMutation.mutate({
                  name: "John Doe",
                  email: "john@example.com",
                })
              }
            />

            <FlatList
              data={users}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
                  <Text className="font-inter-extrabold text-lg">
                    {item.username}
                  </Text>
                  <Button
                    title="Delete"
                    onPress={() => deleteUserMutation.mutate(item.id)}
                    color="red"
                  />
                </View>
              )}
            />
          </View>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default Home;
