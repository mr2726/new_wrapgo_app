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

export default function VehicleDocuments({collectedData, setCollectedData, validationErrors = {}}) {
    const [documents, setDocuments] = React.useState({
        frontView: null,
        backView: null,
    });
    const [uploading, setUploading] = React.useState({
        front: false,
        back: false,
    });
    const [error, setError] = React.useState('');

    const requestLibraryPermission = async () => {
        const {status} = await ImagePicker.requestMediaLibraryPermissionsAsync();
        return status === 'granted';
    };

    const onPressUpload = async (side) => {
        setError('');
        setUploading((prev) => ({...prev, [side]: true}));

        try {
            const hasPermission = await requestLibraryPermission();
            if (!hasPermission) {
                setError('Gallery permission is required to upload documents.');
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

            setCollectedData({
                ...collectedData,
                vehicleRegistrationDoc: {
                    ...(collectedData.vehicleRegistrationDoc || {}),
                    frontView: nextDocuments.frontView,
                    backView: nextDocuments.backView,
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
                insideText={uploading.front ? 'Uploading front document...' : 'Upload the front view of your\nvehicle passport'}
                onPress={() => onPressUpload('front')}
                disabled={uploading.front || uploading.back}
                loading={uploading.front}
            />
            {documents.frontView ? <Text style={styles.successText}>Front document uploaded</Text> : null}

            <UploadDocuments
                insideText={uploading.back ? 'Uploading back document...' : 'Upload the back view of your\nvehicle passport'}
                onPress={() => onPressUpload('back')}
                disabled={uploading.front || uploading.back}
                loading={uploading.back}
                style={{marginTop: spacing.lg}}
            />
            {documents.backView ? <Text style={styles.successText}>Back document uploaded</Text> : null}

            {validationErrors.vehicleRegistrationDoc ? (
                <Text style={styles.errorText}>{validationErrors.vehicleRegistrationDoc}</Text>
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
