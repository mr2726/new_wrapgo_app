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
    isSignupFormValid,
} from './signupFormUtils';



export default function Signup({setLocalPage, setPage}) {
    const [isAgreed, setIsAgreed] = React.useState(false);
    const [submitAttempted, setSubmitAttempted] = React.useState(false);
    const [formErrors, setFormErrors] = React.useState({});

    const [inputValues, setInputValues] = React.useState(INITIAL_SIGNUP_VALUES);

    const validateCurrentForm = () => validateSignupForm(inputValues, isAgreed);
    const isFormValid = isSignupFormValid(inputValues, isAgreed);

    const handleInputChange = (field, value) => {
        setInputValues((prev) => ({ ...prev, [field]: value }));
        if (submitAttempted) {
            setFormErrors(validateCurrentForm());
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
            <Input_
                label="Full Name"
                icon={<Feather name="user" size={20} color="#626262" />}
                value={inputValues.fullName}
                onChangeText={(value) => handleInputChange('fullName', value)}
                error={submitAttempted && formErrors.fullName}
            />
            <Input_
                label="Email"
                icon={<Feather name="mail" size={20} color="#626262" />}
                value={inputValues.email}
                onChangeText={(value) => handleInputChange('email', value)}
                error={submitAttempted && formErrors.email}
            />
            <Input_
                label="Password"
                icon={<Feather name="lock" size={20} color="#626262" />}
                isPassword={true}
                value={inputValues.password}
                onChangeText={(value) => handleInputChange('password', value)}
                error={submitAttempted && formErrors.password}
            />
            <Input_
                label="Confirm Password"
                icon={<Feather name="lock" size={20} color="#626262" />}
                isPassword={true}
                value={inputValues.confirmPassword}
                onChangeText={(value) => handleInputChange('confirmPassword', value)}
                error={submitAttempted && formErrors.confirmPassword}
            />
            <Pressable
                style={styles.termsRow}
                onPress={() => {
                    setIsAgreed((prev) => !prev);
                    if (submitAttempted) {
                        setFormErrors(validateCurrentForm());
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
            <Button_ title="Sign Up" onPress={handleSubmit} dispable={!isFormValid} />
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