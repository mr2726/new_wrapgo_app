import {View, Text, Pressable, StyleSheet} from 'react-native';
import React from 'react';
import {Feather} from '@expo/vector-icons';

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
            setPage('success');
        } catch (error) {
            console.error('Sign in error:', error);
            setAuthError(error?.message || 'Failed to sign in');
        }
    };

    return (
        <View style={styles.screen}>
            <View style={styles.welcomeBlock}>
                <Text style={{color: '#fff', fontSize: 24, fontWeight: 'bold'}}>Welcome to </Text>
                <LOGO />
            </View>
            {SIGNIN_FIELDS.map((field) => (
                <Input_
                    key={field.key}
                    label={field.label}
                    icon={<Feather name={field.icon} size={20} color="#626262" />}
                    isPassword={field.isPassword}
                    value={inputValues[field.key]}
                    onChangeText={(value) => handleInputChange(field.key, value)}
                    error={submitAttempted && formErrors[field.key]}
                />
            ))}
            {Boolean(authError) && (
                <Text style={styles.authError}>{authError}</Text>
            )}
            <Pressable onPress={() => {alert('Comming soon')}} style={{alignSelf: 'flex-end', marginTop: 2}}>
                <Text style={styles.forgotPassword}>Forgot Password?</Text>
            </Pressable>
            <Button_ style={{marginTop: 20}} title="Sign In" onPress={handleSignIn} dispable={false} />
            <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 20}}>
                <Text style={{color: '#727272', fontSize: 12}}>Don't have an account?</Text>
                <Pressable onPress={() => setLocalPage('signup')}><Text style={{color: '#39ff14', marginLeft: 5, fontSize: 12}}>Sign Up</Text></Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    welcomeBlock: {
        flexDirection: 'row',
        alignItems: 'center',
        position: 'absolute',
        top: 30,
    },
    forgotPassword: {
        fontSize: 12,
        color: '#727272',
        alignSelf: 'flex-end',
        marginTop: 0,
    },
    authError: {
        width: '100%',
        color: '#E53935',
        marginTop: 4,
        textAlign: 'right',
        fontSize: 13,
    },
});