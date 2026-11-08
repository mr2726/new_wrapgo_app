import {Image, ScrollView, Text, StyleSheet} from 'react-native';
import React from 'react';
import * as ImagePicker from 'expo-image-picker';
import {colors, spacing, typography} from '../../styles/theme';

// COMPONENTS
import {UploadDocuments} from '../../components/ui/upload';
// ------------------------------------------------------------------------

// SERVICE
import {uploadImageToStorage} from '../../components/service/service';
import {requestPhotoPermission} from '../../components/service/photoPermissions';
// ------------------------------------------------------------------------

const STORAGE_BUCKET = 'documents';

const getFileExtension = (uri = '') => {
    const cleaned = uri.split('?')[0];
    const parts = cleaned.split('.');
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : 'jpg';
};

export default function VehicleDocuments({collectedData, setCollectedData, validationErrors = {}}) {
    const [documents, setDocuments] = React.useState({
        frontView: collectedData.vehicleRegistrationDoc?.frontView || null,
        backView: collectedData.vehicleRegistrationDoc?.backView || null,
    });
    const [uploading, setUploading] = React.useState({
        front: false,
        back: false,
    });
    const [error, setError] = React.useState('');

    const onPressPhoto = async (side) => {
        setError('');
        setUploading((prev) => ({...prev, [side]: true}));

        try {
            const hasPermission = await requestPhotoPermission('camera');
            if (!hasPermission) {
                setError('Camera permission is required to take document photos.');
                return;
            }

            const pickerResult = await ImagePicker.launchCameraAsync({
                mediaTypes: ['images'],
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
            const storagePath = `vehicle-documents/${userKey}/${side}-${timestamp}.${extension}`;

            const uploaded = await uploadImageToStorage({
                uri: asset.uri,
                storagePath,
                bucket: STORAGE_BUCKET,
                contentType: asset.mimeType || `image/${extension}`,
            });

            const nextDocuments = {
                ...documents,
                [side === 'front' ? 'frontView' : 'backView']: uploaded.publicUrl,
            };
            setDocuments(nextDocuments);

            setCollectedData((prev) => ({
                ...prev,
                vehicleRegistrationDoc: {
                    ...(prev.vehicleRegistrationDoc || {}),
                    frontView: nextDocuments.frontView,
                    backView: nextDocuments.backView,
                },
            }));
        } catch (uploadError) {
            setError(uploadError?.message || 'Failed to save document photo. Please try again.');
        } finally {
            setUploading((prev) => ({...prev, [side]: false}));
        }
    };

    return (
        <ScrollView
            style={styles.screen}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
        >
            <UploadDocuments
                insideText={uploading.front ? 'Saving front photo...' : 'Take a photo of the front of your\nvehicle registration'}
                onPress={() => onPressPhoto('front')}
                disabled={uploading.front || uploading.back}
                loading={uploading.front}
                icon="camera"
            />
            {documents.frontView ? (
                <Image source={{uri: documents.frontView}} style={styles.preview} resizeMode="cover" />
            ) : null}

            <UploadDocuments
                insideText={uploading.back ? 'Saving back photo...' : 'Take a photo of the back of your\nvehicle registration'}
                onPress={() => onPressPhoto('back')}
                disabled={uploading.front || uploading.back}
                loading={uploading.back}
                icon="camera"
                style={{marginTop: spacing.lg}}
            />
            {documents.backView ? (
                <Image source={{uri: documents.backView}} style={styles.preview} resizeMode="cover" />
            ) : null}

            {validationErrors.vehicleRegistrationDoc ? (
                <Text style={styles.errorText}>{validationErrors.vehicleRegistrationDoc}</Text>
            ) : null}
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        padding: spacing.lg,
        backgroundColor: colors.background,
        width: '100%',
    },
    content: {
        paddingBottom: 100,
    },
    errorText: {
        color: colors.error,
        marginTop: spacing.sm,
        textAlign: 'right',
        fontSize: typography.sizeSm + 1,
        fontFamily: typography.familyRegular,
    },
    preview: {
        width: '100%',
        height: 190,
        marginTop: spacing.sm,
        borderRadius: 12,
    },
});
