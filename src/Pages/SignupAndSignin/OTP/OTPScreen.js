import {View, Text, StyleSheet} from 'react-native';
import React from 'react';
import {colors, spacing, typography} from '../../../styles/theme';
import {Feather} from '@expo/vector-icons';
import {sendOTP, verifyOTP, changePassword} from '../../../components/service/service';
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
    const [error, setError] = React.useState({
        error: false,
        message: '',
    });
    const [buttonState, setButtonState] = React.useState('getOTP'); // getOTP | verify | reset

    const [phoneError, setPhoneError] = React.useState({
        error: false,
        message: '',
    });
    const [phone, setPhone] = React.useState('');
    const [password, setPassword] = React.useState({
        password: '',
        confirmPassword: '',
    });

    const handleSubmit = () => {
        if (buttonState === 'reset') {
            if (password.password !== password.confirmPassword) {
                setError({error: true, message: 'Passwords do not match'});
                return;
            } else if (password.password.length < 8) {
                setError({error: true, message: 'Password must be at least 8 characters long'});
                return;
            } else {
                setError({error: false, message: ''});
            }
            // Proceed with password reset logic
            changePassword(password.password)
                .then(() => {
                    setError({error: false, message: ''});
                    setPage('success');
                    return;
                })
                .catch((error) => {
                    setError({error: true, message: 'An error occurred. Please try again.'});
                });


        }

        if (buttonState === 'getOTP') {
            if (!phone.trim()) {
                setPhoneError({error: true, message: 'Email is required'});
                return;
            }
            // send OTP logic here
            sendOTP(phone)
                .then(() => {
                    setPhoneError({error: false, message: ''});
                    setButtonState('verify');
                })
                .catch((error) => {
                    setPhoneError({error: true, message: error.message});
                });
            return;
        }

        if (buttonState === 'verify') {
            const otpValue = Object.values(otp).join('');
            if (otpValue.length < 6) {
                setError({error: true, message: 'Please enter a valid 6-digit OTP'});
                return;
            } else {
                setError({error: false, message: ''});
                // Proceed with OTP verification logic
                verifyOTP(phone, otpValue)
                    .then((isValid) => {
                        if (isValid) {
                            setButtonState('reset');
                        } else {
                            setError({error: true, message: 'Invalid OTP. Please try again.'});
                        }
                    })
                    .catch((error) => {
                        setError({error: true, message: 'An error occurred. Please try again.'});
                    });
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
                <Text style={styles.text}>Enter your email address below and we’ll send you a 6-digit OTP code.</Text>

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
                    (buttonState === 'verify' || buttonState === 'reset') && (<OTPinput value={otp} onChangeText={setOtp} error={
                        error.error ? error.message : null
                    } />)
                }
                {
                    buttonState === 'reset' && (
                        <>
                            <Input_ 
                                value={password.password}
                                onChangeText={(value) => setPassword({...password, password: value})}
                                label="New Password"
                                isPassword = {true}
                                icon={<Feather name="lock" size={20} color={colors.icons} />}
                                error={error.error}
                                errorText={error.message}

                            />
                            <Input_ 
                                value={password.confirmPassword}
                                onChangeText={(value) => setPassword({...password, confirmPassword: value})}
                                label="Confirm New Password"
                                isPassword = {true}
                                icon={<Feather name="lock" size={20} color={colors.icons} />}
                                style={{marginBottom: spacing.xl}}
                                error={error.error}
                                errorText={error.message}

                            />
                        </>
                        
                        
                    )
                }
                {error.error ? <Text style={styles.error}>{error.message}</Text> : null}
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