import {View, Text, StyleSheet, Pressable} from 'react-native';
import React from 'react';
import {Feather} from '@expo/vector-icons';

// COMPONENTS
import {TopControl} from '../../components/ui/topControl';
import {Input_} from '../../components/ui/inputs';
import {Button_} from '../../components/ui/buttons';
// ------------------------------------------------------------------------
// BACKEND
import {signUpWithEmail, saveDriverData} from '../../components/service/service';
import {
    INITIAL_SIGNUP_VALUES,
    validateSignupForm,
} from './signupFormUtils';

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



export default function Signup({setLocalPage, setPage}) {
    const [isAgreed, setIsAgreed] = React.useState(false);
    const [submitAttempted, setSubmitAttempted] = React.useState(false);
    const [formErrors, setFormErrors] = React.useState({});

    const [inputValues, setInputValues] = React.useState(INITIAL_SIGNUP_VALUES);

    const validateCurrentForm = () => validateSignupForm(inputValues, isAgreed);

    const handleInputChange = (field, value) => {
        const nextValues = { ...inputValues, [field]: value };
        setInputValues(nextValues);
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

        try {
            const user = await signUpWithEmail(inputValues.email, inputValues.password);
            const data = await saveDriverData(user.id, inputValues.fullName, inputValues.email);
            console.log('Driver data saved:', data);
            setPage('success');
        } catch (error) {
            console.error('Error:', error);
        }
        
    };

    return (
        <View style={styles.screen}>
            <View style={{position: "relative", height: 50, marginBottom: 20}}>
                <TopControl setLocalPage={setLocalPage} />
            </View>
            {signupFields.map((field) => (
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
                    {isAgreed && <Feather name="check" size={14} color="#040404" />}
                </View>
                <Text style={styles.termsText}>I have read and agree to the <Text style={{color: '#39ff14'}}>Terms of Service</Text></Text>
            </Pressable>
            {submitAttempted && formErrors.isAgreed && (
                <Text style={styles.checkboxError}>{formErrors.isAgreed}</Text>
            )}
            <Button_ title="Sign Up" onPress={handleSubmit} dispable={false} />
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        width: '100%',
        height: '100%',
        backgroundColor: '#040404',
        paddingHorizontal: 16,
    },
    text: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
    },
    termsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 20,
        gap: 10,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#626262',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    checkboxActive: {
        backgroundColor: '#39ff14',
        borderColor: '#39ff14',
    },
    termsText: {
        color: '#fff',
        flex: 1,
    },
    checkboxError: {
        color: '#E53935',
        marginTop: -12,
        marginBottom: 12,
        textAlign: 'right',
        fontSize: 13,
    },
});