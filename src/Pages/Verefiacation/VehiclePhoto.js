import {View, Text, StyleSheet} from 'react-native';
import React from 'react';
import * as ImagePicker from 'expo-image-picker';
import {colors, spacing, typography} from '../../styles/theme';

// COMPONENTS
import {UploadDocuments} from '../../components/ui/upload';
// ------------------------------------------------------------------------

// SERVICE
import {uploadImageToStorage} from '../../components/service/service';
// ------------------------------------------------------------------------

const STORAGE_BUCKET = 'documents';

const getFileExtension = (uri = '') => {
    const cleaned = uri.split('?')[0];
    const parts = cleaned.split('.');
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : 'jpg';
};

export default function VehiclePhoto({collectedData, setCollectedData, validationErrors}) {
    const [photos, setPhotos] = React.useState({
        leftSide: collectedData.vehiclePhoto?.leftSide || null,
        rightSide: collectedData.vehiclePhoto?.rightSide || null,
    });
    const [uploading, setUploading] = React.useState({
        left: false,
        right: false,
    });
    const [error, setError] = React.useState('');

    const requestLibraryPermission = async () => {
        const {status} = await ImagePicker.requestMediaLibraryPermissionsAsync();
        return status === 'granted';
    };

    const onPressUpload = async (side) => {
        setError('');

        const hasPermission = await requestLibraryPermission();
        if (!hasPermission) {
            setError('Gallery permission is required to upload vehicle photos.');
            return;
        }

        const pickerResult = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: false,
            quality: 0.9,
        });

        if (pickerResult.canceled || !pickerResult.assets?.length) {
            return;
        }

        const asset = pickerResult.assets[0];
        const extension = getFileExtension(asset.uri);
        const userKey = collectedData.email || 'driver';
        const timestamp = Date.now();
        const fileLabel = side === 'left' ? 'LeftSide' : 'RightSide';
        const storagePath = `vehicle-documents/${userKey}/${fileLabel}-${timestamp}.${extension}`;

        setUploading((prev) => ({...prev, [side]: true}));
        try {
            const uploaded = await uploadImageToStorage({
                uri: asset.uri,
                storagePath,
                bucket: STORAGE_BUCKET,
                contentType: asset.mimeType || `image/${extension}`,
            });

            const nextPhotos = {
                ...photos,
                [side === 'left' ? 'leftSide' : 'rightSide']: uploaded.publicUrl,
            };
            setPhotos(nextPhotos);

            setCollectedData({
                ...collectedData,
                vehiclePhoto: {
                    ...(collectedData.vehiclePhoto || {}),
                    leftSide: nextPhotos.leftSide,
                    rightSide: nextPhotos.rightSide,
                },
            });
        } catch (uploadError) {
            setError(uploadError?.message || 'Failed to upload image. Please try again.');
        } finally {
            setUploading((prev) => ({...prev, [side]: false}));
        }
    };

    return (
        <View style={styles.screen}>
            <UploadDocuments
                insideText={uploading.left ? 'Uploading left side photo...' : 'Upload a photo of your vehicle\'s\nleft side'}
                onPress={() => onPressUpload('left')}
            />
            {photos.leftSide ? <Text style={styles.successText}>Left side photo uploaded</Text> : null}

            <UploadDocuments
                insideText={uploading.right ? 'Uploading right side photo...' : 'Upload a photo of your vehicle\'s\nright side'}
                onPress={() => onPressUpload('right')}
                style={{marginTop: spacing.lg}}
            />
            {photos.rightSide ? <Text style={styles.successText}>Right side photo uploaded</Text> : null}

            {validationErrors?.vehiclePhoto ? (
                <Text style={styles.errorText}>{validationErrors.vehiclePhoto}</Text>
            ) : null}
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        padding: spacing.lg,
        backgroundColor: colors.background,
        width: '100%',
    },
    title: {
        fontSize: typography.size2xl,
        fontWeight: 'bold',
        marginBottom: spacing.sm,
        color: colors.textPrimary,
    },
    subtitle: {
        fontSize: typography.sizeLg,
        color: colors.textSecondary,
    },
    errorText: {
        color: colors.error,
        marginTop: spacing.sm,
        textAlign: 'right',
        fontSize: typography.sizeSm + 1,
        fontFamily: typography.familyRegular,
    },
    successText: {
        color: colors.accent,
        marginTop: spacing.xs,
        textAlign: 'right',
        fontSize: typography.sizeSm,
        fontFamily: typography.familyRegular,
    },
});