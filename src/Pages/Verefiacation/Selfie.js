import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  Image,
  StyleSheet,
} from 'react-native';
import {CameraView, useCameraPermissions} from 'expo-camera';
import {colors, spacing, typography} from '../../styles/theme';

export default function SelfieScreen({collectedData, setCollectedData, validationErrors}) {
    const [permission, requestPermission] = useCameraPermissions();
    const cameraRef = useRef(null);

    const [photo, setPhoto] = useState(collectedData?.selfieLocalUri || null);
    const [cameraTextState, setCameraTextState] = useState(true);

    useEffect(() => {
        if (!permission) return;
        if (!permission.granted) requestPermission();
        const timer = setTimeout(() => setCameraTextState(false), 5000);
        return () => clearTimeout(timer);
    }, [permission]);

    const takeSelfie = async () => {
        if (!cameraRef.current) return;
        const result = await cameraRef.current.takePictureAsync({quality: 0.8});
        setPhoto(result.uri);
        setCollectedData({...collectedData, selfieLocalUri: result.uri, selfie: null});
    };

    const retake = () => {
        setPhoto(null);
        setCollectedData({...collectedData, selfieLocalUri: null, selfie: null});
    };

    if (!permission) return null;

    if (!permission.granted) {
        return (
            <View style={styles.center}>
                <Text style={{color: colors.textPrimary}}>We don't have access to the camera</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {!photo ? (
                <>
                    <CameraView ref={cameraRef} style={styles.camera} facing="front" />
                    <View style={styles.frame}>
                        <View style={[styles.corner, styles.topLeft]} />
                        <View style={[styles.corner, styles.topRight]} />
                        <View style={[styles.corner, styles.bottomLeft]} />
                        <View style={[styles.corner, styles.bottomRight]} />
                        {cameraTextState && (
                            <Text style={styles.textInCamera}>
                                Scan your face to verify your identity
                            </Text>
                        )}
                    </View>
                    <TouchableOpacity style={styles.captureButton} onPress={takeSelfie}>
                        <View style={styles.innerCircle} />
                    </TouchableOpacity>
                </>
            ) : (
                <>
                    <Image source={{uri: photo}} style={styles.preview} />
                    {validationErrors?.selfie ? (
                        <Text style={styles.errorText}>{validationErrors.selfie}</Text>
                    ) : null}
                    <TouchableOpacity style={styles.retakeButton} onPress={retake}>
                        <Text style={styles.buttonText}>Again</Text>
                    </TouchableOpacity>
                </>
            )}
        </View>
    );
}

const SIZE = 280;
const CORNER = 40;
const BORDER = 4;
const COLOR = '#00FF66';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: 100,
  },
  camera: {
    flex: 1,
  },
  preview: {
    flex: 1,
  },
  captureButton: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.accent,
  },
  retakeButton: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.md,
    borderRadius: spacing.md,
  },
  buttonText: {
    fontFamily: typography.familyRegular,
    color: colors.textPrimary,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  frame: {
    width: SIZE,
    height: SIZE,
    alignSelf: 'center',
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{translateX: '-50%'}, {translateY: '-50%'}],
    justifyContent: 'center',
    alignItems: 'center',
  },
  corner: {
    position: 'absolute',
    width: CORNER,
    height: CORNER,
    borderColor: COLOR,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: BORDER,
    borderLeftWidth: BORDER,
    borderTopLeftRadius: 18,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: BORDER,
    borderRightWidth: BORDER,
    borderTopRightRadius: 18,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: BORDER,
    borderLeftWidth: BORDER,
    borderBottomLeftRadius: 18,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: BORDER,
    borderRightWidth: BORDER,
    borderBottomRightRadius: 18,
  },
  textInCamera: {
    fontFamily: typography.familyRegular,
    color: colors.textPrimary,
    fontSize: typography.sizeSm,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  errorText: {
    position: 'absolute',
    top: spacing.lg,
    alignSelf: 'center',
    color: colors.error,
    fontFamily: typography.familyRegular,
    fontSize: typography.sizeSm,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
});
