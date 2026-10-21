import {View, Text, StyleSheet, ActivityIndicator} from 'react-native';
import React from 'react';
import {colors, spacing, typography} from '../../styles/theme';
import {Feather} from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// COMPONENTS
import {ProgressBar} from '../../components/ui/ProgressBar';
import {TopControl} from '../../components/ui/topControl';
import {Button_} from '../../components/ui/buttons';
import {supabase} from '../../components/service/supabase';
// ------------------------------------------------------------------------

// SERVICE
import {
    uploadImageToStorage,
    updateVehicleData,
    finalizeAuthAccount,
    finalizeDriverRegistration,
} from '../../components/service/service';
// ------------------------------------------------------------------------

// CONTENT
import DriverInfo from './DriverInfo';
import VehicleType from './VehicleType';
import VehicleInfo from './VehicleInfo';
import VehicleDocuments from './VehicleDocuments';
import VehiclePhoto from './VehiclePhoto';
import SelfieScreen from './Selfie';
import Success from '../../components/screens/Success';
// ------------------------------------------------------------------------

const STORAGE_BUCKET = 'documents';

export default function VereficationContent({setPage, signUpInfo}) {
    const [currentScreen, setCurrentScreen] = React.useState(0); // 0 - 5
    const [validationErrors, setValidationErrors] = React.useState({});
    const [selfieUploading, setSelfieUploading] = React.useState(false);
    const [selfieError, setSelfieError] = React.useState('');
    const isSubmittingRef = React.useRef(false);
    const uploadedSelfieRef = React.useRef({localUri: null, publicUrl: null});

    const [collectedData, setCollectedData] = React.useState({
        fullName: signUpInfo.fullName || '',
        email: signUpInfo.email || '',
        password: signUpInfo.password || '',
        phoneNumber: '',
        birthDate: '',
        vehicleType: '',
        ownVehicle: false,
        otherVehicle: false,
        vehicleMake: '',
        vehicleModel: '',
        vehicleYear: '',
        vehicleRegistrationDoc: {
            frontView: null,
            backView: null,
        },
        vehiclePhoto: {
            leftSide: null,
            rightSide: null,
        },
        selfie: null,
        selfieLocalUri: null,
        otp: '',
    });

    const validateCurrentScreen = () => {
        const nextErrors = {};

        if (currentScreen === 0) {
            const phoneDigits = String(collectedData.phoneNumber || '').replace(/\D/g, '');

            if (!collectedData.fullName?.trim()) {
                nextErrors.fullName = 'Full name is required';
            }
            if (!collectedData.email?.trim()) {
                nextErrors.email = 'Email is required';
            }
            if (phoneDigits.length < 11) {
                nextErrors.phoneNumber = 'Enter a valid phone number';
            }
            if (!collectedData.birthDate?.trim()) {
                nextErrors.birthDate = 'Date of birth is required';
            }
        }

        if (currentScreen === 1) {
            if (!collectedData.ownVehicle && !collectedData.otherVehicle) {
                nextErrors.vehicleType = 'Select at least one option';
            }
        }

        if (currentScreen === 3) {
            const frontView = collectedData.vehicleRegistrationDoc?.frontView;
            const backView = collectedData.vehicleRegistrationDoc?.backView;
            if (!frontView || !backView) {
                nextErrors.vehicleRegistrationDoc = 'Upload front and back vehicle documents';
            }
        }

        if (currentScreen === 4) {
            if (!collectedData.selfieLocalUri) {
                nextErrors.selfie = 'Please take a selfie to continue';
            }
        }

        setValidationErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const handleContinue = async () => {
        if (isSubmittingRef.current) return;
        if (!validateCurrentScreen()) return;

        if (currentScreen === 4) {
            isSubmittingRef.current = true;
            setSelfieError('');
            setSelfieUploading(true);

            try {
                // Reuse the already-uploaded selfie if the user is retrying without
                // retaking the photo, so we never upload duplicate selfie files.
                let selfieUrl = collectedData.selfie;
                if (!selfieUrl || uploadedSelfieRef.current.localUri !== collectedData.selfieLocalUri) {
                    const userKey = collectedData.email || 'driver';
                    const storagePath = `vehicle-documents/${userKey}/selfie.jpg`;

                    const result = await uploadImageToStorage({
                        uri: collectedData.selfieLocalUri,
                        storagePath,
                        bucket: STORAGE_BUCKET,
                        contentType: 'image/jpeg',
                    });

                    selfieUrl = result.publicUrl;
                    uploadedSelfieRef.current = {localUri: collectedData.selfieLocalUri, publicUrl: selfieUrl};
                    setCollectedData((current) => ({...current, selfie: selfieUrl}));
                }

                // The Auth account and driver record are NOT created here yet -
                // only once the user presses "Go to Home" on the next screen.
                setCurrentScreen(5);
            } catch (err) {
                console.log(err);
                setSelfieError(err?.message || 'Failed to upload selfie. Please try again.');
            } finally {
                setSelfieUploading(false);
                isSubmittingRef.current = false;
            }
            return;
        }

        if (currentScreen < 4) {
            setCurrentScreen(currentScreen + 1);
            return;
        }

        if (currentScreen === 5) {
            isSubmittingRef.current = true;
            setSelfieError('');
            setSelfieUploading(true);

            try {
                // The real Auth account and final registration data are only
                // created here, when the user presses "Go to Home".
                const authUser = await finalizeAuthAccount(collectedData.email, collectedData.password);
                const finalData = {...collectedData};

                await finalizeDriverRegistration(authUser.id, finalData);
                await updateVehicleData(finalData.otp, finalData);

                await AsyncStorage.setItem('isLogined', 'true');
                setPage('content');
            } catch (err) {
                console.log(err);
                setSelfieError(err?.message || 'Failed to complete registration. Please try again.');
            } finally {
                setSelfieUploading(false);
                isSubmittingRef.current = false;
            }
        }
    };

    const selfieValidationErrors = React.useMemo(() => ({
        ...validationErrors,
        selfie: validationErrors.selfie || selfieError || undefined,
    }), [validationErrors, selfieError]);

    if (sessionState.loading) {
        return (
            <View style={[styles.screen, styles.centered]}>
                <ActivityIndicator color={colors.accent} />
                <Text style={styles.message}>Preparing verification...</Text>
            </View>
        );
    }

    if (sessionState.error) {
        return (
            <View style={[styles.screen, styles.centered]}>
                <Text style={styles.title}>Unable to start verification</Text>
                <Text style={styles.message}>{sessionState.error}</Text>
                <View style={{marginTop: spacing.lg, width: '100%'}}>
                    <Button_ title="Retry" onPress={bootstrapSession} />
                </View>
            </View>
        );
    }

    return (
        <View style={styles.screen}>
            <View style={{position: 'relative', height: 50, marginBottom: 20}}>
                <TopControl title="Driver Verification" setLocalPage={() => currentScreen <= 0 ? setPage('signupandsignin') : setCurrentScreen(currentScreen - 1)}/>
            </View>
            <ProgressBar step={5} activeStep={currentScreen} />
            <Text style={styles.screenText}>
                {currentScreen === 0 && 'Personal Info'}
                {currentScreen === 1 && 'Vehicle Ownership'}
                {currentScreen === 2 && 'Vehicle Information'}
                {currentScreen === 3 && 'Vehicle Documentation'}
                {/* {currentScreen === 4 && 'Vehicle Photo'} */}
                {currentScreen === 4 && 'Selfie'}
            </Text>

            {currentScreen === 0 && (
                <DriverInfo
                    collectedData={collectedData}
                    setCollectedData={setCollectedData}
                    validationErrors={validationErrors}
                />
            )}
            {currentScreen === 1 && (
                <VehicleType
                    collectedData={collectedData}
                    setCollectedData={setCollectedData}
                    validationErrors={validationErrors}
                />
            )}
            {currentScreen === 2 && (
                <VehicleInfo
                    collectedData={collectedData}
                    setCollectedData={setCollectedData}
                    validationErrors={validationErrors}
                />
            )}
            {currentScreen === 3 && (
                <VehicleDocuments
                    collectedData={collectedData}
                    setCollectedData={setCollectedData}
                    validationErrors={validationErrors}
                />
            )}
            {/* {currentScreen === 4 && (
                <VehiclePhoto
                    collectedData={collectedData}
                    setCollectedData={setCollectedData}
                    validationErrors={validationErrors}
                />
            )} */}
            {currentScreen === 4 && (
                <>
                    <Text style={styles.selfieNotice}>Selfie is required to complete registration.</Text>
                    <SelfieScreen
                        collectedData={collectedData}
                        setCollectedData={setCollectedData}
                        validationErrors={selfieValidationErrors}
                    />
                </>
            )}

            {currentScreen === 5 && (
                <>
                    <Success
                        title="Selfie Captured"
                        description="Press Go to Home to finish creating your account."
                    />
                    {selfieError ? <Text style={styles.selfieNotice}>{selfieError}</Text> : null}
                </>
            )}

            <View style={{position: 'absolute', bottom: spacing.xxl, left: 0, right: 0, paddingHorizontal: spacing.lg}}>
                <Button_
                    title={selfieUploading ? (currentScreen === 5 ? 'Finishing...' : 'Uploading...') : currentScreen === 5 ? 'Go to Home' : 'Continue'}
                    onPress={handleContinue}
                    disabled={selfieUploading}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        width: '100%',
        height: '100%',
        marginTop: spacing.xl,
        paddingHorizontal: spacing.lg,
    },
    centered: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: typography.xl,
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginTop: spacing.lg,
    },
    message: {
        fontSize: typography.sizeMd,
        color: colors.textSecondary,
        textAlign: 'center',
        marginTop: spacing.md,
    },
    screenText: {
        fontSize: typography.sizeLg,
        color: colors.textPrimary,
        marginBottom: spacing.lg,
        fontFamily: typography.familyRegular,
        textAlign: 'center',
    },
    selfieNotice: {
        fontSize: typography.sizeSm,
        color: colors.textSecondary,
        fontFamily: typography.familyRegular,
        textAlign: 'center',
        marginBottom: spacing.md,
    },
});
