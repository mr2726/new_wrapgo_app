import {View, Text, StyleSheet, Pressable} from 'react-native';
import React from 'react';
import {Feather} from '@expo/vector-icons';

// COMPONENTS
import {TopControl} from '../../components/ui/topControl';
import {Input_} from '../../components/ui/inputs';
import {Button_} from '../../components/ui/buttons';
import {FormScroll} from '../../components/ui/layout';
// ------------------------------------------------------------------------
// BACKEND
import {
    INITIAL_SIGNUP_VALUES,
    validateSignupForm,
} from './signupFormUtils';
import {colors, radius, spacing, typography} from '../../styles/theme';

const signupFields = [
    {
        key: 'fullName',
        label: 'Full Name',
        icon: 'user',
        isPassword: false,
    },
    {
        key: 'email',
        label: 'Email',
        icon: 'mail',
        isPassword: false,
    },
    {
        key: 'password',
        label: 'Password',
        icon: 'lock',
        isPassword: true,
    },
    {
        key: 'confirmPassword',
        label: 'Confirm Password',
        icon: 'lock',
        isPassword: true,
    },
];



export default function Signup({setLocalPage, setPage, signUpInfo}) {
    const [isAgreed, setIsAgreed] = React.useState(false);
    const [submitAttempted, setSubmitAttempted] = React.useState(false);
    const [formErrors, setFormErrors] = React.useState({});

    const [inputValues, setInputValues] = React.useState(INITIAL_SIGNUP_VALUES);

    const validateCurrentForm = () => validateSignupForm(inputValues, isAgreed);

    const handleInputChange = (field, value) => {
        const nextValue = field === 'email' ? value.toLowerCase() : value;
        const nextValues = { ...inputValues, [field]: nextValue };
        setInputValues(nextValues);
        signUpInfo(nextValues);
        if (submitAttempted) {
            setFormErrors(validateSignupForm(nextValues, isAgreed));
        }
    };

    const handleSubmit = async () => {
        setSubmitAttempted(true);
        const errors = validateCurrentForm();
        setFormErrors(errors);

        if (Object.keys(errors).length > 0) {
            return;
        }

        // Supabase Auth account + driver record are created only after the
        // mandatory selfie step succeeds (see VereficationContent.handleContinue).
        signUpInfo(inputValues);
        setPage('verification');
    };

    return (
        <View style={styles.screen}>
            <View style={{position: "relative", height: 50, marginBottom: 20}}>
                <TopControl setLocalPage={setLocalPage} title="Create Account" switchTo="signin" />
            </View>
            <FormScroll>
            {signupFields.map((field) => (
                <Input_
                    key={field.key}
                    label={field.label}
                    icon={<Feather name={field.icon} size={20} color={colors.textMuted} />}
                    isPassword={field.isPassword}
                    value={inputValues[field.key]}
                    onChangeText={(value) => handleInputChange(field.key, value)}
                    error={submitAttempted && formErrors[field.key]}
                    type={field.key === 'email' ? 'email-address' : 'default'}
                    autoCapitalize={field.key === 'email' ? 'none' : 'sentences'}
                    autoCorrect={field.key === 'email' ? false : true}
                />
            ))}
            <Pressable
                style={styles.termsRow}
                onPress={() => {
                    const nextIsAgreed = !isAgreed;
                    setIsAgreed(nextIsAgreed);
                    if (submitAttempted) {
                        setFormErrors(validateSignupForm(inputValues, nextIsAgreed));
                    }
                }}
            >
                <View style={[styles.checkbox, isAgreed && styles.checkboxActive]}>
                    {isAgreed && <Feather name="check" size={14} color={colors.background} />}
                </View>
                <Text style={styles.termsText}>I have read and agree to the <Text style={{color: colors.accent}}>Terms of Service</Text></Text>
            </Pressable>
            {submitAttempted && formErrors.isAgreed && (
                <Text style={styles.checkboxError}>{formErrors.isAgreed}</Text>
            )}
            <Button_ title="Sign Up" onPress={handleSubmit} dispable={false} />

            <Text style={styles.signinText}>Already have an account? <Text style={{color: colors.accent}} onPress={() => setLocalPage('signin')}>Sign In</Text></Text>
            </FormScroll>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: colors.background,
        paddingHorizontal: spacing.lg,
    },
    text: {
        color: colors.textPrimary,
        fontSize: typography.size2xl,
        fontFamily: typography.familyBold,
    },
    termsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: spacing.xl,
        marginBottom: spacing.xl,
        gap: spacing.sm + 2,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: radius.sm,
        borderWidth: 1,
        borderColor: colors.textMuted,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    checkboxActive: {
        backgroundColor: colors.accent,
        borderColor: colors.accent,
    },
    termsText: {
        color: colors.textPrimary,
        flex: 1,
        fontFamily: typography.familyRegular,
        fontSize: typography.sizeSm
    },
    signinText: {
        color: colors.textSecondary,
        fontSize: typography.sizeSm,
        textAlign: 'center',
        marginTop: spacing.lg,
    },
    checkboxError: {
        color: colors.error,
        marginTop: -12,
        marginBottom: 12,
        textAlign: 'right',
        fontSize: typography.sizeSm + 1,
        fontFamily: typography.familyRegular,
    },
});