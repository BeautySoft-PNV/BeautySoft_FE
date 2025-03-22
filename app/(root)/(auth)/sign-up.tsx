import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  Modal,
  ActivityIndicator,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SignUp = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    setLoading(true);
    const API_URL = "http://192.168.2.155:5280/api/auth/register";

    try {
      const newErrors: { [key: string]: string } = {};
      if (
        username.trim() !== "" &&
        email.trim() !== "" &&
        password.trim() !== "" &&
        confirmPassword.trim() === ""
      ) {
        newErrors.confirmPassword = "Confirm Password is required";
        setErrors(newErrors);
        setLoading(false);
        return;
      }
      if (
        username.trim() !== "" &&
        email.trim() !== "" &&
        password.trim() !== "" &&
        confirmPassword !== password
      ) {
        newErrors.confirmPassword = "Passwords do not match";
        setErrors(newErrors);
        setLoading(false);
        return;
      }

      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          email,
          password,
          roleId: 1,
        }),
      });
      const responseData = await response.json();

      if (!response.ok) {
        setLoading(false);
        if (responseData.errors) {
          if (responseData.errors.Email) {
            newErrors.email = responseData.errors.Email.join("\n");
          }
          if (responseData.errors.Password) {
            newErrors.password = responseData.errors.Password.join("\n");
          }
          if (responseData.errors.Username) {
            newErrors.username = responseData.errors.Username.join("\n");
          }

          setErrors(newErrors);
          return;
        }
        throw new Error(responseData.message || "Registration failed");
      }

      if (responseData.token) {
        await AsyncStorage.setItem("token", responseData.token);
      }
      setLoading(false);
      await AsyncStorage.setItem("user", JSON.stringify(responseData));
      router.push("/(root)/(auth)/sign-in");
    } catch (error: any) {
      setLoading(false);
      setErrors({ general: error.message });
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.container}>
            <Text style={styles.logo}>BeautySoft</Text>

            <Text style={styles.title}>
              Full Name <Text style={styles.noticed}>*</Text>{" "}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="To Loan..."
              placeholderTextColor="#C4C4C4"
              value={username}
              onChangeText={(text) => {
                setUsername(text);
                setErrors((prev) => ({ ...prev, username: "" }));
              }}
            />
            {errors.username ? (
              <Text style={styles.errorText}>{errors.username}</Text>
            ) : null}

            <Text style={styles.title}>
              Email <Text style={styles.noticed}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="loan@gmail.com..."
              placeholderTextColor="#C4C4C4"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setErrors((prev) => ({ ...prev, email: "" }));
              }}
            />
            {errors.email ? (
              <Text style={styles.errorText}>{errors.email}</Text>
            ) : null}

            <Text style={styles.title}>
              Password <Text style={styles.noticed}>*</Text>
            </Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.inputPassword}
                placeholder="********"
                placeholderTextColor="#C4C4C4"
                secureTextEntry={!passwordVisible}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setErrors((prev) => ({ ...prev, password: "" }));
                }}
              />
              <TouchableOpacity
                onPress={() => setPasswordVisible(!passwordVisible)}
              >
                <FontAwesome
                  name={passwordVisible ? "eye" : "eye-slash"}
                  size={20}
                  color="gray"
                />
              </TouchableOpacity>
            </View>
            {errors.password ? (
              <Text style={styles.errorText}>{errors.password}</Text>
            ) : null}

            <Text style={styles.title}>
              Confirm Password <Text style={styles.noticed}>*</Text>
            </Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.inputPassword}
                placeholder="********"
                placeholderTextColor="#C4C4C4"
                secureTextEntry={!confirmPasswordVisible}
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  setErrors((prev) => ({ ...prev, confirmPassword: "" }));
                }}
              />
              <TouchableOpacity
                onPress={() =>
                  setConfirmPasswordVisible(!confirmPasswordVisible)
                }
              >
                <FontAwesome
                  name={confirmPasswordVisible ? "eye" : "eye-slash"}
                  size={20}
                  color="gray"
                />
              </TouchableOpacity>
            </View>
            {errors.confirmPassword ? (
              <Text style={styles.errorText}>{errors.confirmPassword}</Text>
            ) : null}

            <TouchableOpacity style={styles.button} onPress={handleSignUp}>
              <Text style={styles.buttonText}>Sign up</Text>
            </TouchableOpacity>
            <View style={styles.forgot}>
              <TouchableOpacity
                onPress={() => router.push("/(root)/(auth)/sign-in")}
              >
                <Text style={styles.link}>Sign in</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => router.push("/(root)/(auth)/forgot-password")}
              >
                <Text style={styles.link}>Forgot Password</Text>
              </TouchableOpacity>
            </View>
          </View>
          {loading && (
            <Modal transparent animationType="fade">
              <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                  <ActivityIndicator size="large" color="white" />
                  <Text
                    style={{
                      color: "white",
                      fontFamily: "PlayfairDisplay-Bold",
                    }}
                  >
                    Processing request...
                  </Text>
                </View>
              </View>
            </Modal>
          )}
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "white",
  },
  noticed: {
    color: "red",
  },
  forgot: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 20,
  },
  logo: {
    fontSize: 60,
    fontFamily: "PlayfairDisplay-Bold",
    color: "#ED1E51",
    marginBottom: 50,
    textShadowColor: "#c1a6b3",
    textShadowOffset: { width: 9, height: 3 },
    textShadowRadius: 5,
    width: "100%",
  },
  title: {
    fontSize: 18,
    fontFamily: "PlayfairDisplay-Bold",
    color: "black",
    marginBottom: 5,
    alignSelf: "flex-start",
  },
  input: {
    width: "100%",
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginBottom: 10,
    backgroundColor: "white",
    fontFamily: "PlayfairDisplay-Bold",
    fontSize: 18,
    color: "black",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    paddingHorizontal: 10,
    backgroundColor: "white",
    marginBottom: 10,
    padding: 7,
  },
  inputPassword: {
    flex: 1,
    paddingVertical: 3,
    fontFamily: "PlayfairDisplay-Bold",
    fontSize: 18,
    color: "black",
  },
  button: {
    backgroundColor: "#e91e63",
    padding: 10,
    borderRadius: 5,
    width: "100%",
    alignItems: "center",
    marginTop: 12,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontFamily: "PlayfairDisplay-Bold",
  },
  link: {
    marginTop: 20,
    fontSize: 17,
    color: "#007bff",
    fontFamily: "PlayfairDisplay-Bold",
  },
  errorText: {
    color: "red",
    fontSize: 15,
    fontFamily: "PlayfairDisplay-Bold",
    marginBottom: 10,
    alignSelf: "flex-start",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "#ED1E51",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
});

export default SignUp;
