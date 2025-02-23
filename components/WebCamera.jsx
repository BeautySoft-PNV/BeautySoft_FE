// components/WebCamera.jsx
import React, { useRef, useEffect } from 'react';

const WebCamera = () => {
    const videoRef = useRef(null);

    useEffect(() => {
        async function setupCamera() {
            if (navigator.mediaDevices?.getUserMedia) {
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({
                        video: true,
                    });
                    videoRef.current.srcObject = stream;
                } catch (err) {
                    console.error("Error accessing the webcam: ", err);
                }
            } else {
                console.error("Webcam not supported in this browser.");
            }
        }

        setupCamera();
    }, []);

    return <video ref={videoRef} autoPlay style={{ width: '100%', height: 'auto' }} />;
};

export default WebCamera;
