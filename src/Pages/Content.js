import {View, StyleSheet} from 'react-native';
import React from 'react';

// Pages Content Page
import OnboardingContent from './Onboarding/OnboardingContent';
import SignupAndSigninContent from './SignupAndSignin/SignupAndSigninContent';

// Temp Page Success
import Success from '../components/screens/Success';
// ------------------------------------------------------------------------

export default function Content() {
    const [page, setPage] = React.useState("onboarding");
    return (
        <View style={styles.screen}>
            {page === "onboarding" && <OnboardingContent setPage={setPage} />}
            {page === "signupandsignin" && <SignupAndSigninContent setPage={setPage} />}
            {page === "success" && <Success title="Success" description="Your account has been created successfully!" />}
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: '#040404',
        marginVertical: 25,
    },
});