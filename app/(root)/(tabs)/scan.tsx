import { CameraView, useCameraPermissions } from "expo-camera";
import { useState, useRef } from "react";
import {
    Button,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Image,
    TextInput,
} from "react-native";
import { router } from "expo-router";
import { AntDesign } from "@expo/vector-icons";


export default function Scan() {
    const [facing, setFacing] = useState<"front" | "back">("back");
    const [permission, requestPermission] = useCameraPermissions();
    const cameraRef = useRef<CameraView | null>(null);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [imageDescription, setImageDescription] = useState<string>("");


    if (!permission) return <View />;
    if (!permission.granted) {
        return (
            <View style={styles.container}>
                <Text style={styles.message}>Request permision for Camera!</Text>
                <Button onPress={requestPermission} title="Permision" />
            </View>
        );
    }


    function toggleCameraFacing() {
        setFacing((current) => (current === "back" ? "front" : "back"));
    }


    async function takePicture() {
        if (cameraRef.current) {
            const photo = await cameraRef.current.takePictureAsync();
            if (photo) {
                setCapturedImage(photo.uri);
            }
        }
    }


    function retakePicture() {
        setCapturedImage(null);
        setImageDescription("");
    }


    console.log("capturedImage: ", capturedImage)
    return (
        <View style={styles.container}>
            {!capturedImage ? (
                <>
                    <CameraView ref={cameraRef} style={styles.camera} facing={facing} />
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={styles.buttonChangeCamera}
                            onPress={toggleCameraFacing}
                        >
                            <Text style={styles.text}>🔄 Change camera</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.buttonTakePicture}
                            onPress={takePicture}
                        >
                            <Text style={styles.text}>📸 Take a picture</Text>
                        </TouchableOpacity>
                    </View>
                </>
            ) : (
                <View style={styles.previewContainer}>
                    <View style={styles.imageContainer}>
                        <Image source={{ uri:capturedImage  }} style={styles.preview} />
                        <TouchableOpacity
                            style={styles.retakeButton}
                            onPress={retakePicture}
                        >
                            <Text style={styles.text}>🔄 ReTake</Text>
                        </TouchableOpacity>
                    </View>


                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Input request"
                            value={imageDescription}
                            onChangeText={setImageDescription}
                        />
                        <TouchableOpacity
                            onPress={() =>
                                router.push({
                                    pathname: "/generate",
                                    params: { imageUri: capturedImage, request: imageDescription },
                                })
                            }
                        >
                            <AntDesign name="upload" size={24} color="black" style={styles.iconStyle} />
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </View>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        backgroundColor: "#f0f0f0",
    },
    message: {
        textAlign: "center",
        paddingBottom: 10,
    },
    camera: {
        flex: 1,
    },
    buttonContainer: {
        position: "absolute",
        bottom: 100,
        width: "100%",
        flexDirection: "row",
        justifyContent: "space-evenly",
        padding: 10,
    },
    buttonChangeCamera: {
        padding: 12,
        backgroundColor: "#007AFF",
        borderRadius: 5,
    },
    buttonTakePicture: {
        padding: 12,
        backgroundColor: "#ED1E51",
        borderRadius: 5,
    },
    text: {
        fontSize: 16,
        fontWeight: "bold",
        color: "white",
    },
    previewContainer: {
        flex: 1,
        alignItems: "center",
        width: "100%",
    },
    imageContainer: {
        flex: 0.8,
        width: "100%",
        alignItems: "center",
        position: "relative",
    },
    preview: {
        width: "100%",
        height: "100%",
        resizeMode: "cover",
    },
    inputContainer: {
        flex: 0.2,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "#ccc",
        paddingHorizontal: 10,
        borderRadius: 5,
        backgroundColor: "white",
        width: "100%",
        marginBottom: 65,
    },
    input: {
        flex: 1,
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: "#ccc",
        padding: 10,
        borderRadius: 5,
        backgroundColor: "white",
    },
    uploadImage: {
        marginLeft: 20,
    },
    retakeButton: {
        position: "absolute",
        bottom: 10, 
        right: 10, 
        backgroundColor: "#007AFF",
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 5,
        alignItems: "center",
    },
    iconStyle: {
        marginLeft: 10,
    },
});




