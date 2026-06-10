import {View, Text, StyleSheet} from 'react-native';
import React from 'react';
import {colors, radius, spacing, typography} from '../../../styles/theme';
import {Feather} from '@expo/vector-icons';

// COMPONENTS
import {TopControl} from '../../../components/ui/topControl';
import {OTPinput} from '../../../components/ui/OTPinput';
import {Button_} from '../../../components/ui/buttons';
import {Input_} from "../../../components/ui/inputs";
// ------------------------------------------------------------------------

export default function OTPScreen({setLocalPage, setPage}) {
    const [otp, setOtp] = React.useState({
        input1: '',
        input2: '',
        input3: '',
        input4: '',
        input5: '',
        input6: '',
    });
    const [error, setError] = React.useState('');
    const [buttonState, setButtonState] = React.useState('getOTP'); // getOTP | verify | reset

    const [phoneError, setPhoneError] = React.useState({
        error: false,
        message: '',
    });
    const [phone, setPhone] = React.useState('');

    const handleSubmit = () => {
        if (buttonState === 'reset') {
            // Proceed with password reset logic
            setPage('success');
            return;
        }

        if (buttonState === 'getOTP') {
            if (!phone.trim()) {
                setPhoneError({error: true, message: 'Email is required'});
                return;
            }
            setPhoneError({error: false, message: ''});
            setButtonState('verify');
            return;
        }

        if (buttonState === 'verify') {
            const otpValue = Object.values(otp).join('');
            if (otpValue.length < 6) {
                setError('Please enter a valid 6-digit OTP');
                return;
            } else {
                setError('');
                // Proceed with OTP verification logic
                setButtonState('reset');
                return;
            }
        }
    };

    return (
        <View style={styles.screen}>
            <View style={{position: "relative", height: 50, marginBottom: 20}}>
                <TopControl setLocalPage={setLocalPage} title="Verify Code" />
            </View>
            <View>
                <Text style={styles.text}>Enter your email address below and we’ll send you a link to reset your password.</Text>

                <Input_ 
                    value={phone} 
                    onChangeText={(value) => setPhone(value)} 
                    label="Email address"
                    error={phoneError.error}
                    errorText={phoneError.message}
                    icon={<Feather name="mail" size={20} color={colors.icons} />}
                    style={buttonState === 'getOTP' ? {marginBottom: spacing.xl} : {marginBottom: 0}}
                />
                {
                    (buttonState === 'verify' || buttonState === 'reset') && (<OTPinput value={otp} onChangeText={setOtp} error={error} />)
                }
                {error ? <Text style={styles.error}>{error}</Text> : null}
                <Button_ title={
                    buttonState === "getOTP" 
                    ? "Send OTP Code"
                    : buttonState === "verify" 
                    ? "Verify OTP"
                    : "Reset Password"
                } onPress={handleSubmit} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        width: '100%',
        height: '100%',
        backgroundColor: colors.background,
        paddingHorizontal: spacing.lg,
    },
    error: {
        color: colors.error,
        marginBottom: spacing.md,
    },
    text: {
        color: colors.textSecondary,
        fontSize: typography.sizeSm,
        textAlign: 'center',
        marginBottom: spacing.xl,
    },
});