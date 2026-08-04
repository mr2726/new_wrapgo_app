import React from "react";
import {View, Text, Image, StyleSheet, Pressable, Alert} from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import {colors, typography} from "../../styles/theme";
import {Camera} from "../Icons";

// COMPONENTS
import {Button_} from "../ui/buttons";
import {uploadImageToStorage, updateVehicleWrapPhotos} from "../service/service";
// --------------------------------------------------------------

const normalizeStatus = (value) => String(value || '').trim().toLowerCase();

const parseCampaignDuration = (duration) => {
    const durationText = String(duration || '').trim().toLowerCase();
    const match = durationText.match(/^(\d+)\s*([dwmy])$/i);

    if (!match) {
        return null;
    }

    return {
        amount: Number(match[1]),
        unit: match[2].toLowerCase(),
    };
};

const addDurationToDate = (startDate, duration) => {
    const parsedDuration = parseCampaignDuration(duration);

    if (!parsedDuration || !Number.isFinite(parsedDuration.amount) || parsedDuration.amount <= 0) {
        return null;
    }

    const endDate = new Date(startDate);

    if (parsedDuration.unit === 'd') {
        endDate.setDate(endDate.getDate() + parsedDuration.amount);
        return endDate;
    }

    if (parsedDuration.unit === 'w') {
        endDate.setDate(endDate.getDate() + (parsedDuration.amount * 7));
        return endDate;
    }

    if (parsedDuration.unit === 'm') {
        endDate.setMonth(endDate.getMonth() + parsedDuration.amount);
        return endDate;
    }

    if (parsedDuration.unit === 'y') {
        endDate.setFullYear(endDate.getFullYear() + parsedDuration.amount);
        return endDate;
    }

    return null;
};

const formatDateTimeLabel = (value) => {
    if (!value) {
        return '-';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return '-';
    }

    return new Intl.DateTimeFormat('en-US', {
        weekday: 'short',
        month: 'short',
        day: '2-digit',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    }).format(date);
};

export const ContractItem = ({data, status, signedAt, onStatusUpdated, setSelectedTab}) => {
    const [leftSidePhoto, setLeftSidePhoto] = React.useState(null);
    const [rightSidePhoto, setRightSidePhoto] = React.useState(null);
    const [isUploading, setIsUploading] = React.useState(false);
    const [driverContext, setDriverContext] = React.useState({email: null, inviteCode: null, contractId: null});

    const normalizedStatus = React.useMemo(() => normalizeStatus(status), [status]);
    const isUnderReview = normalizedStatus === 'under review';

    const contractEndDate = React.useMemo(() => {
        if (!data?.created_at) {
            return null;
        }

        return addDurationToDate(new Date(data.created_at), data.duration);
    }, [data?.created_at, data?.duration]);

    React.useEffect(() => {
        const loadDriverContext = async () => {
            try {
                const userDataString = await AsyncStorage.getItem('userData');

                if (!userDataString) {
                    return;
                }

                const userData = JSON.parse(userDataString);
                setDriverContext({
                    email: userData?.email || null,
                    inviteCode: userData?.carid || null,
                    contractId: userData?.contractid ?? null,
                });
            } catch (error) {
                console.log('[ContractItem] failed to read userData:', error?.message || error);
            }
        };

        loadDriverContext();
    }, []);

    const openCameraAndUpload = async (side) => {
        if (!driverContext.inviteCode) {
            Alert.alert('Missing fleet code', 'Please set Fleet Code in Settings before uploading wrap photos.');
            return;
        }

        const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();

        if (!cameraPermission.granted) {
            Alert.alert('Permission required', 'Camera permission is required to take vehicle photos.');
            return;
        }

        const cameraResult = await ImagePicker.launchCameraAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.9,
        });

        if (cameraResult.canceled || !cameraResult.assets?.[0]?.uri) {
            return;
        }

        try {
            setIsUploading(true);

            const timestamp = Date.now();
            const storagePath = `vehicle-documents/${driverContext.inviteCode}/wrap-${side}-${timestamp}.jpg`;

            const uploadResult = await uploadImageToStorage({
                uri: cameraResult.assets[0].uri,
                storagePath,
            });

            const uploadedUrl = uploadResult.publicUrl;
            const nextLeftUrl = side === 'left' ? uploadedUrl : leftSidePhoto;
            const nextRightUrl = side === 'right' ? uploadedUrl : rightSidePhoto;

            if (side === 'left') {
                setLeftSidePhoto(uploadedUrl);
            } else {
                setRightSidePhoto(uploadedUrl);
            }

            const updateResult = await updateVehicleWrapPhotos({
                inviteCode: driverContext.inviteCode,
                leftImageUrl: nextLeftUrl,
                rightImageUrl: nextRightUrl,
                driverEmail: driverContext.email,
                contractId: driverContext.contractId,
            });

            if (nextLeftUrl && nextRightUrl) {
                Alert.alert('Success', 'Both photos uploaded. Contract status is now under review.');

                if (typeof onStatusUpdated === 'function') {
                    await onStatusUpdated(updateResult?.signedContract || null);
                }
            }
        } catch (error) {
            Alert.alert('Upload failed', error?.message || 'Could not upload photo. Please try again.');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10}}>
                <View style={{borderBottomWidth: 1, borderBottomColor: colors.border, display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 10}}>
                    <Image source={{uri: data.document}} style={styles.image} />
                    <View>
                        <Text style={styles.title}>{data.name}</Text>
                        <Text style={styles.description}>{data.city}</Text>
                    </View>
                </View>
                <View style={styles.status}>
                    <Text style={styles.statusText}>{status}</Text>
                </View>
            </View>
            <View>
                <Text style={styles.title}>{status === "under review" ? "The photos under review" : "Go to wrapping"}</Text>
                <Text style={styles.description}>Contract ends: {formatDateTimeLabel(contractEndDate)}</Text>
                {!!signedAt && <Text style={styles.description}>Signed at: {formatDateTimeLabel(signedAt)}</Text>}
            </View>

            {!isUnderReview && (
                <>
                    <View style={[styles.photoButtons, {display: 'flex', flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, marginBottom: 10}]}>
                        <Pressable style={styles.sidePick} onPress={() => openCameraAndUpload('left')} disabled={isUploading}>
                            <Camera width={30} height={30} />
                            <Text style={styles.sideText}>Left Side</Text>
                        </Pressable>
                        <Pressable style={styles.sidePick} onPress={() => openCameraAndUpload('right')} disabled={isUploading}>
                            <Camera width={30} height={30} />
                            <Text style={styles.sideText}>Right Side</Text>
                        </Pressable>
                    </View>

                    <Button_
                        title={(leftSidePhoto && rightSidePhoto) ? "Go Active" : "Go to Wrap"}
                        onPress={() => setSelectedTab("service_visit")}
                        style={{marginTop: 10}}
                        dispable={isUploading}
                    />
                </>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        backgroundColor: colors.surface,
        borderRadius: 8,
        marginBottom: 10,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.textPrimary,
    },
    image: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    description: {
        fontSize: 14,
        color: colors.textSecondary,
    },
    status: {
        marginTop: 10,
        borderStyle: 'solid',
        borderWidth: 1,
        borderColor: "#FFC107",
        padding: 5,
        paddingHorizontal: 10,
        borderRadius: 100,
        alignItems: 'center',
    },
    statusText: {
        fontSize: 12,
        color: colors.textPrimary,
        fontFamily: typography.familyRegular,
    },
    sidePick: {
        flex: 1,
        width: 100,
        height: 100,
        padding: 10,
        borderWidth: 1,
        borderColor: colors.borderLight,
        borderRadius: 8,
        alignItems: 'center',
        marginRight: 10,
        display: 'flex',
        justifyContent: 'center',
        alignContent: 'center',
    },
    sideText: {
        color: colors.textPrimary,
        fontFamily: typography.familyRegular,
    }
});