import {View, Text, Image, StyleSheet, Pressable, ScrollView, Alert, Linking} from 'react-native';
import React from 'react';
import {colors, radius, spacing, typography} from '../../styles/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from 'expo-image-picker';
// COMPONENT
import { TopControl } from '../../components/ui/topControl';
import { ProfileInfoBlock } from '../../components/ui/profileInfoBlock';
import { ScoreBreakdown } from '../../components/ui/ScoreBreakdown';
import { SegmentedControl_ } from '../../components/ui/segmentedControl';
import { Chart } from '../../components/ui/Chart';
import { ProfilePhotoSheet } from '../../components/ui/ProfilePhotoSheet';
import { getSignedContracts, uploadImageToStorage, updateDriverSelfie } from '../../components/service/service';
// ----------------------------------------------------------

const normalizeWeeklyStat = (weeklyStat) => {
    if (!weeklyStat) {
        return {distance: [], hours: []};
    }

    if (typeof weeklyStat === 'string') {
        try {
            const parsed = JSON.parse(weeklyStat);
            return {
                distance: Array.isArray(parsed?.distance) ? parsed.distance : [],
                hours: Array.isArray(parsed?.hours) ? parsed.hours : [],
            };
        } catch {
            return {distance: [], hours: []};
        }
    }

    return {
        distance: Array.isArray(weeklyStat?.distance) ? weeklyStat.distance : [],
        hours: Array.isArray(weeklyStat?.hours) ? weeklyStat.hours : [],
    };
};

const sumWeeklyStatValues = (items) => {
    if (!Array.isArray(items)) {
        return 0;
    }

    return items.reduce((total, item) => {
        const numericValue = Number(item?.value);
        return total + (Number.isFinite(numericValue) ? numericValue : 0);
    }, 0);
};

export default function Profile ({setLocalPage}) {
    const [userData, setUserData] = React.useState(null);
    const [statsStartDate, setStatsStartDate] = React.useState(null);
    const [chartState, setChartState] = React.useState('distance'); // 'distance' or 'hours'
    const [isSheetVisible, setIsSheetVisible] = React.useState(false);
    const [isUpdatingPhoto, setIsUpdatingPhoto] = React.useState(false);
    React.useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userDataString = await AsyncStorage.getItem('userData');
                if (userDataString) {
                    const userData = JSON.parse(userDataString);
                    setUserData(userData);

                    if (userData?.email) {
                        const signedContracts = await getSignedContracts({email: userData.email});
                        const latestSignedContract = (signedContracts || []).find((row) => row?.signed_at);
                        setStatsStartDate(latestSignedContract?.signed_at || null);
                    }
                }
            } catch (error) {
                console.error('Error fetching user data from AsyncStorage:', error);
            }
        };

        fetchUserData();
    }, []);

    const weeklyStat = React.useMemo(
        () => normalizeWeeklyStat(userData?.weeklyStat),
        [userData?.weeklyStat]
    );

    const daysSinceRegistration = React.useMemo(() => {
        const startDateSource = statsStartDate || userData?.created_at;

        if (!startDateSource) return 1;

        const createdAt = new Date(startDateSource);
        if (Number.isNaN(createdAt.getTime())) return 1;

        const now = new Date();
        const diffInMs = now - createdAt;
        const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

        return Math.max(1, diffInDays);
    }, [statsStartDate, userData?.created_at]);

    const weeklyDistanceTotal = React.useMemo(
        () => sumWeeklyStatValues(weeklyStat.distance),
        [weeklyStat.distance]
    );
    const weeklyHoursTotal = React.useMemo(
        () => sumWeeklyStatValues(weeklyStat.hours),
        [weeklyStat.hours]
    );

    const totalDistance = weeklyDistanceTotal > 0
        ? weeklyDistanceTotal
        : (Number(userData?.totaldistance) || 0);
    const totalZoneHours = weeklyHoursTotal > 0
        ? weeklyHoursTotal
        : (Number(userData?.zonehourse) || 0);

    const avgDistancePerDay = (totalDistance / daysSinceRegistration).toFixed(1);
    const avgZoneHoursPerDay = (totalZoneHours / daysSinceRegistration).toFixed(1);
    // Get this data from DB 
    const safety = userData?.score.safety || 0;
    const acceptance = userData?.score.acceptance || 0;
    const activity = userData?.score.activity || 0;

    const score = Math.round((safety + acceptance + activity) / 3);

    const persistUserData = React.useCallback(async (nextUserData) => {
        setUserData(nextUserData);
        await AsyncStorage.setItem('userData', JSON.stringify(nextUserData));
    }, []);

    const updateSelfie = React.useCallback(async (uri) => {
        if (!userData?.email) {
            throw new Error('User email not found');
        }

        setIsUpdatingPhoto(true);
        try {
            let selfieUrl = null;

            if (uri) {
                const fileExt = uri.split('.').pop()?.toLowerCase();
                const supportedExt = fileExt === 'png' ? 'png' : 'jpg';
                const storagePath = `vehicle-documents/${userData.email}/Selfie-${Date.now()}.${supportedExt}`;
                const uploadResult = await uploadImageToStorage({
                    uri,
                    storagePath,
                    contentType: supportedExt === 'png' ? 'image/png' : 'image/jpeg',
                });

                selfieUrl = uploadResult.publicUrl;
            }

            await updateDriverSelfie(userData.email, selfieUrl);
            const nextUserData = {
                ...userData,
                selfie: selfieUrl,
            };

            await persistUserData(nextUserData);
            setIsSheetVisible(false);
        } finally {
            setIsUpdatingPhoto(false);
        }
    }, [persistUserData, userData]);

    const handleChooseFromLibrary = React.useCallback(async () => {
        try {
            const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!permission.granted) {
                Alert.alert('Permission required', 'Allow photo library access to choose profile photo.');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled && result.assets?.[0]?.uri) {
                await updateSelfie(result.assets[0].uri);
            }
        } catch (error) {
            console.error('Error picking image from library:', error);
            Alert.alert('Upload failed', 'Could not choose photo. Please try again.');
        }
    }, [updateSelfie]);

    const handleTakePhoto = React.useCallback(async () => {
        try {
            const permission = await ImagePicker.requestCameraPermissionsAsync();
            if (!permission.granted) {
                if (permission.canAskAgain === false) {
                    Alert.alert(
                        'Camera permission blocked',
                        'Open app settings and allow camera access to take profile photo.',
                        [
                            {text: 'Cancel', style: 'cancel'},
                            {text: 'Open settings', onPress: () => Linking.openSettings()},
                        ]
                    );
                } else {
                    Alert.alert('Permission required', 'Allow camera access to take profile photo.');
                }
                return;
            }

            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled && result.assets?.[0]?.uri) {
                await updateSelfie(result.assets[0].uri);
            }
        } catch (error) {
            console.error('Error taking image with camera:', error);
            const errorMessage = String(error?.message || 'Unknown camera error');
            Alert.alert(
                'Camera failed',
                `Could not take photo. ${errorMessage}`
            );
        }
    }, [updateSelfie]);

    const handleRemovePhoto = React.useCallback(() => {
        Alert.alert('Remove photo', 'Are you sure you want to remove current photo?', [
            {text: 'Cancel', style: 'cancel'},
            {
                text: 'Remove',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await updateSelfie(null);
                    } catch (error) {
                        console.error('Error removing profile photo:', error);
                        Alert.alert('Remove failed', 'Could not remove photo. Please try again.');
                    }
                },
            },
        ]);
    }, [updateSelfie]);

    // Edit BTN handler
    const handleEditPress = () => {
        setIsSheetVisible(true);
    };

    return (
        <>
            <ScrollView style={{marginBottom: 100}}>
                <View style={styles.topControll}>
                    <TopControl setLocalPage={setLocalPage} title="My Profile" additionalBTN="settings" switchTo="home"/>
                </View>
                <View style={styles.profileContent}>
                    <View style={styles.profileHeaderRow}>
                        <View style={styles.avatarContainer}>
                            {userData?.selfie ? (
                                <Image source={{uri: userData.selfie}} style={styles.selfie} />
                            ) : (
                                <View style={styles.selfiePlaceholder}>
                                    <Feather name="user" size={34} color={colors.textSecondary} />
                                </View>
                            )}
                            <Pressable onPress={handleEditPress} style={styles.edit}>
                                <Feather name="edit" size={16} color="white" />
                            </Pressable>
                        </View>
                        <View>
                            <Text style={styles.text}>Evening {userData?.name}</Text>
                            <View style={{display: "flex", flexDirection: "row", alignItems: "center", gap: 5}}>
                                <Feather name="star" size={14} color={colors.accent} style={{marginRight: 5, marginTop: 5}} />
                                <Text style={styles.text}>{score}%</Text>
                            </View>
                        </View>
                    </View>
                    <ScoreBreakdown safety={safety} acceptance={acceptance} activity={activity}/>
                    <View style={styles.metricsRow}>
                        <ProfileInfoBlock title="Distance" value={`${totalDistance.toFixed(1)} km`} description={`AVG ${avgDistancePerDay} km/day`}/>
                        <ProfileInfoBlock title="Zone Hours" value={`${totalZoneHours.toFixed(1)} h`} description={`AVG ${avgZoneHoursPerDay} h/day`}/>
                    </View>
                </View>
                <View style={{marginTop: 10}}>
                    <SegmentedControl_ 
                        options={[
                            { label: 'Distance', value: 'distance' },
                            { label: 'Hours', value: 'hours' },
                        ]}
                        value={chartState}
                        onValueChange={(value) => setChartState(value)}
                    />
                    <View style={{marginTop: 20}}>
                        {chartState === 'distance' && <Chart data={weeklyStat.distance} />}
                        {chartState === 'hours' && <Chart data={weeklyStat.hours} />}
                    </View>
                </View>
            </ScrollView>
            <ProfilePhotoSheet
                visible={isSheetVisible}
                onClose={() => setIsSheetVisible(false)}
                onChooseFromLibrary={handleChooseFromLibrary}
                onTakePhoto={handleTakePhoto}
                onRemovePhoto={handleRemovePhoto}
                hasPhoto={Boolean(userData?.selfie)}
                loading={isUpdatingPhoto}
            />
        </>
    )
} 


const styles = StyleSheet.create({
    text: {
        width: 200,
        color: "white",
        fontSize: typography.sizeMd,
        fontFamily: typography.familyRegular,
        marginTop: spacing.sm,
    },

    topControll: {
        marginBottom: 30,
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        position: "relative"
    },
    profileContent: {
        marginTop: 20,
        width: "100%",
    },
    profileHeaderRow: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: 20,
        marginBottom: 20,
    },
    avatarContainer: {
        width: 95,
        height: 95,
        position: "relative",
    },
    metricsRow: {
        marginTop: 20,
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 20,
    },
    selfie: {
        width: 95,
        height: 95,
        borderRadius: 95,
    },
    selfiePlaceholder: {
        width: 95,
        height: 95,
        borderRadius: 95,
        backgroundColor: colors.surfaceMuted,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
    },
    edit: {
        width: 30,
        height: 30,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        position: "absolute",
        bottom: 0,
        right: 0,
        backgroundColor: colors.iconBG,
        borderRadius: 25,
        padding: spacing.xs,
    },
})