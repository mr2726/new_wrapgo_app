import {View, Text, StyleSheet} from 'react-native';
import React from 'react';
import {colors, spacing, typography} from '../../styles/theme';

// COMPONENTS
import {ToggleButton_} from '../../components/ui/toggleButton';
import {OTPinput} from '../../components/ui/OTPinput';
// ------------------------------------------------------------------------

// SERVICE
import {getVehicleDataByOTP} from '../../components/service/service';
// ------------------------------------------------------------------------

export default function VehicleType({collectedData, setCollectedData, validationErrors = {}}) {
    const [toggleState, setToggleState] = React.useState({
        ownVehicle: false,
        otherVehicle: false,
    });
    const [otp, setOtp] = React.useState({
        input1: '',
        input2: '',
        input3: '',
        input4: '',
        input5: '',
        input6: '',
    });
    const [otpError, setOtpError] = React.useState('');
    const [isOtpLoading, setIsOtpLoading] = React.useState(false);
    const lastFetchedOtpRef = React.useRef('');

    const otpValue = React.useMemo(() => Object.values(otp).join(''), [otp]);

    const handleToggleChange = (field, nextValue) => {
        const nextState = field === 'ownVehicle'
            ? {ownVehicle: nextValue, otherVehicle: nextValue ? false : toggleState.otherVehicle}
            : {ownVehicle: nextValue ? false : toggleState.ownVehicle, otherVehicle: nextValue};

        setToggleState(nextState);
        setCollectedData((prev) => ({
            ...prev,
            ownVehicle: nextState.ownVehicle,
            otherVehicle: nextState.otherVehicle,
            vehicleType: nextState.ownVehicle ? 'own' : nextState.otherVehicle ? 'other' : '',
        }));
    };

    React.useEffect(() => {
        if (!toggleState.otherVehicle) {
            setOtpError('');
            setIsOtpLoading(false);
            lastFetchedOtpRef.current = '';
            return;
        }

        if (otpValue.length !== 6) {
            setOtpError('');
            return;
        }

        if (lastFetchedOtpRef.current === otpValue) {
            return;
        }

        setIsOtpLoading(true);
        setOtpError('');

        getVehicleDataByOTP(otpValue)
            .then((vehicleData) => {
                lastFetchedOtpRef.current = otpValue;
                setCollectedData((prev) => ({
                    ...prev,
                    otp: otpValue,
                    vehicleMake: vehicleData?.mark || '',
                    vehicleModel: vehicleData?.model || '',
                    vehicleYear: vehicleData?.year || '',
                }));
            })
            .catch(() => {
                setOtpError('Invite code not found');
                setCollectedData((prev) => ({
                    ...prev,
                    otp: otpValue,
                    vehicleMake: '',
                    vehicleModel: '',
                    vehicleYear: '',
                }));
            })
            .finally(() => {
                setIsOtpLoading(false);
            });
    }, [otpValue, setCollectedData, toggleState.otherVehicle]);

    return (
        <View style={styles.screen}>
            <View style={styles.row}>
                <Text style={styles.labelText}>I own this vehicle</Text>
                <ToggleButton_ dispable={true} onPress={(value) => handleToggleChange('ownVehicle', value)} />
            </View>

            <View style={[styles.row, {marginTop: spacing.lg}]}>
                <Text style={styles.labelText}>I am driving someone else's vehicle</Text>
                <ToggleButton_ onPress={(value) => handleToggleChange('otherVehicle', value)} />
            </View>
            {validationErrors.vehicleType ? (
                <Text style={styles.errorText}>{validationErrors.vehicleType}</Text>
            ) : null}
            {
                toggleState.otherVehicle && (
                    <View style={{marginTop: spacing.lg}}>
                        <Text style={styles.OTPLable}>Enter Invite Code</Text>
                        <OTPinput
                            value={otp}
                            onChangeText={(nextOtp) => {
                                setOtp(nextOtp);
                                setCollectedData((prev) => ({
                                    ...prev,
                                    otp: Object.values(nextOtp).join(''),
                                }));
                            }}
                        />
                        {isOtpLoading ? <Text style={styles.helperText}>Loading vehicle data...</Text> : null}
                        {otpError ? <Text style={styles.errorText}>{otpError}</Text> : null}
                    </View>
                )
            }
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: colors.background,
        marginVertical: 25,
        paddingHorizontal: spacing.lg,
    },
    row: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    labelText: {
        color: colors.textSecondary,
        fontSize: typography.sizeSm,
        fontFamily: typography.familyRegular,
    },
    OTPLable: {
        color: colors.textPrimary,
        fontSize: typography.sizeLg,
        fontFamily: typography.familyRegular,
        marginTop: spacing.lg,
    },
    errorText: {
        color: colors.error,
        marginTop: spacing.sm,
        textAlign: 'right',
        fontSize: typography.sizeSm + 1,
        fontFamily: typography.familyRegular,
    },
    helperText: {
        color: colors.textSecondary,
        marginTop: spacing.sm,
        textAlign: 'right',
        fontSize: typography.sizeSm,
        fontFamily: typography.familyRegular,
    },
});
