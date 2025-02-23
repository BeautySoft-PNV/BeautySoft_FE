import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  Image,
  ActivityIndicator,
} from "react-native";
import { Camera } from "expo-camera";
import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-react-native";
import * as faceLandmarksDetection from "@tensorflow-models/face-landmarks-detection";
import * as ImageManipulator from "expo-image-manipulator";
import * as jpeg from "jpeg-js";

type FaceDataType = {
  faceInViewConfidence: number;
  boundingBox: { topLeft: number[]; bottomRight: number[] };
  mesh: number[][];
  scaledMesh: number[][];
  annotations: Record<string, number[][]>;
};

const Scan = () => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [faceData, setFaceData] = useState<FaceDataType | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const cameraRef = useRef<Camera | null>(null);
  const [model, setModel] = useState<faceLandmarksDetection.FaceLandmarksDetector | null>(null);

  useEffect(() => {
    const loadModel = async () => {
      try {
        const { status } = await Camera.requestCameraPermissionsAsync();
        if (status !== "granted") {
          setErrorMessage("Quyền truy cập camera bị từ chối.");
          return;
        }
        setHasPermission(true);

        await tf.ready();
        await tf.setBackend("rn-webgl");

        const loadedModel = await faceLandmarksDetection.load(
          faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh,
          { runtime: "tfjs" }
        );
        setModel(loadedModel);
      } catch (error: any) {
        setErrorMessage("Lỗi khi tải model: " + error.message);
      }
    };

    loadModel();
  }, []);

  const fetchImage = async (uri: string) => {
    try {
      const response = await fetch(uri);
      if (!response.ok) throw new Error("Không thể tải ảnh.");

      const arrayBuffer = await response.arrayBuffer();
      const rawImageData = new Uint8Array(arrayBuffer);
      const { width, height, data } = jpeg.decode(rawImageData, true);

      return tf.tensor3d(data, [height, width, 3], "int32");
    } catch (error: any) {
      setErrorMessage("Lỗi chuyển đổi ảnh: " + error.message);
      return null;
    }
  };

  const analyzeFace = async () => {
    if (!cameraRef.current) {
      setErrorMessage("Camera chưa sẵn sàng.");
      return;
    }
    if (!model) {
      setErrorMessage("Model chưa được tải.");
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const photo = await cameraRef.current.takePictureAsync({ base64: true });
      setCapturedPhoto(photo.uri);

      const manipResult = await ImageManipulator.manipulateAsync(
        photo.uri,
        [{ resize: { width: 224, height: 224 } }],
        { base64: true }
      );

      const imgTensor = await fetchImage(manipResult.uri);
      if (!imgTensor) throw new Error("Không thể xử lý ảnh.");

      const predictions = await model.estimateFaces({ input: imgTensor });

      if (!predictions || predictions.length === 0 || !predictions[0]) {
        setFaceData(null);
        setErrorMessage("Không tìm thấy khuôn mặt!");
        setLoading(false);
        return;
      }
      const face = predictions[0];
      if (!face.annotations || !face.annotations.hasOwnProperty("noseTip")) {
        setFaceData(null);
        setErrorMessage("Không thể phát hiện đặc điểm khuôn mặt!");
        setLoading(false);
        return;
      }
  
      setFaceData(face as FaceDataType);
      setErrorMessage(null);
    } catch (error: any) {
      setErrorMessage("Lỗi phát hiện khuôn mặt: " + error.message);
    }
    setLoading(false);
  };

  if (hasPermission === null) return <ActivityIndicator />;
  if (hasPermission === false) return <Text style={styles.errorText}>Không có quyền truy cập camera.</Text>;

  return (
    <View style={styles.container}>
      <Camera style={styles.camera} ref={cameraRef} />
      <Button title="Scan Face" onPress={analyzeFace} />
      
      {loading && <ActivityIndicator size="large" color="#00ff00" style={styles.loader} />}
      
      {capturedPhoto && <Image source={{ uri: capturedPhoto }} style={styles.image} />}
      
      {faceData && (
        <Text style={styles.faceText}>
          Khuôn mặt được phát hiện: {JSON.stringify(faceData)}
        </Text>
      )}

      {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center" },
  camera: { width: 300, height: 400, borderRadius: 10, marginBottom: 10 },
  image: { width: 100, height: 100, marginTop: 10, borderRadius: 10 },
  loader: { marginTop: 10 },
  errorText: { color: "red", fontSize: 16, fontWeight: "bold", marginTop: 10 },
  faceText: { marginTop: 10, color: "blue", fontSize: 16 },
});

export default Scan;
