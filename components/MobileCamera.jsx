// components/MobileCamera.jsx
import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Camera, useCameraDevices } from 'react-native-vision-camera';

const MobileCamera = () => {
    const [hasPermission, setHasPermission] = useState(false);
    const devices = useCameraDevices();
    const device = devices.back; // Use the back camera
    const cameraRef = useRef(null);

    // Request camera permission
    useEffect(() => {
        (async () => {
            const status = await Camera.requestCameraPermission();
            setHasPermission(status === 'authorized');
        })();
    }, []);

    if (!device || !hasPermission) {
        return <Text>Camera not available or permission not granted.</Text>;
    }

    return (
        <View style={styles.container}>
            <Camera
                style={StyleSheet.absoluteFill}
                device={device}
                isActive={true}
                ref={cameraRef}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default MobileCamera;
