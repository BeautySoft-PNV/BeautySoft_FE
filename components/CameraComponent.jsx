import { Platform } from 'react-native';

const CameraComponent = () => {
    if (Platform.OS === 'web') {
        const WebCamera = require('./WebCamera').default; // Sử dụng webcam trên web
        return <WebCamera />;
    } else {
        const MobileCamera = require('./MobileCamera').default; // Sử dụng VisionCamera trên di động
        return <MobileCamera />;
    }
};

export default CameraComponent;
