import {View, Text, Pressable, StyleSheet} from 'react-native';
import React from 'react';
import {Feather} from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// COMPONENTS
import {LOGO}  from '../../components/ui/LOGO';
import {Input_} from '../../components/ui/inputs';
import {Button_} from '../../components/ui/buttons';
// ------------------------------------------------------------------------

// BACKEND
import {signInWithEmail} from '../../components/service/service';
import {
    INITIAL_SIGNIN_VALUES,
    SIGNIN_FIELDS,
    validateSignInForm,
} from './signinFormUtils';
import {colors, spacing, typography} from '../../styles/theme';
// ------------------------------------------------------------------------

export default function Signin({setLocalPage, setPage}) {
    const [inputValues, setInputValues] = React.useState(INITIAL_SIGNIN_VALUES);
    const [submitAttempted, setSubmitAttempted] = React.useState(false);
    const [formErrors, setFormErrors] = React.useState({});
    const [authError, setAuthError] = React.useState('');

    const handleInputChange = (field, value) => {
        const nextValues = { ...inputValues, [field]: value };
        setInputValues(nextValues);
        if (submitAttempted) {
            setFormErrors(validateSignInForm(nextValues.email, nextValues.password));
        }
        if (authError) {
            setAuthError('');
        }
    };

    const handleSignIn = async () => {
        setSubmitAttempted(true);
        setAuthError('');

        const errors = validateSignInForm(inputValues.email, inputValues.password);
        setFormErrors(errors);

        if (Object.keys(errors).length > 0) {
            return;
        }

        try {
            await signInWithEmail(inputValues.email.trim(), inputValues.password);
            await AsyncStorage.setItem('isLogined', 'true');
            setPage('content');
        } catch (error) {
            console.error('Sign in error:', error);
            setAuthError(error?.message || 'Failed to sign in');
        }
    };

    return (
        <View style={styles.screen}>
            <View style={styles.welcomeBlock}>
                <Text style={{color: colors.textPrimary, fontSize: typography.size2xl, fontFamily: typography.familyBold}}>Welcome to </Text>
                <LOGO />
            </View>
            {SIGNIN_FIELDS.map((field) => (
                <Input_
                    key={field.key}
                    label={field.label}
                    icon={<Feather name={field.icon} size={20} color={colors.textMuted} />}
                    isPassword={field.isPassword}
                    value={inputValues[field.key]}
                    onChangeText={(value) => handleInputChange(field.key, value)}
                    error={submitAttempted && formErrors[field.key]}
                />
            ))}
            {Boolean(authError) && (
                <Text style={styles.authError}>{authError}</Text>
            )}
            <Pressable onPress={() => {setLocalPage('otp')}} style={{alignSelf: 'flex-end', marginTop: 2}}>
                <Text style={styles.forgotPassword}>Forgot Password?</Text>
            </Pressable>
            <Button_ style={{marginTop: 20}} title="Sign In" onPress={handleSignIn} dispable={false} />
            <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 20}}>
                <Text style={{color: colors.textMuted, fontSize: typography.sizeSm, fontFamily: typography.familyRegular}}>Don't have an account?</Text>
                <Pressable onPress={() => setLocalPage('signup')}><Text style={{color: colors.accent, marginLeft: 5, fontSize: typography.sizeSm, fontFamily: typography.familyRegular}}>Sign Up</Text></Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
    },
    welcomeBlock: {
        flexDirection: 'row',
        alignItems: 'center',
        position: 'absolute',
        top: 30,
    },
    forgotPassword: {
        fontSize: typography.sizeSm,
        color: colors.textMuted,
        alignSelf: 'flex-end',
        marginTop: 0,
        fontFamily: typography.familyRegular,
    },
    authError: {
        width: '100%',
        color: colors.error,
        marginTop: 4,
        textAlign: 'right',
        fontSize: typography.sizeSm + 1,
        fontFamily: typography.familyRegular,
    },
});