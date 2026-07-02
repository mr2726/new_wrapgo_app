import {View, StyleSheet} from 'react-native';
import React from 'react';
import {colors} from '../styles/theme';

// Pages Content Page
import OnboardingContent from './Onboarding/OnboardingContent';
import SignupAndSigninContent from './SignupAndSignin/SignupAndSigninContent';
import VereficationContent from './Verefiacation/VereficationContent';
import ContentPage from './Content/Content';

// Temp Page Success
import Success from '../components/screens/Success';
// ------------------------------------------------------------------------

export default function Content({isLogined, setIsLogined}) {
    const [page, setPage] = React.useState(
        isLogined ? "content" : "onboarding"
    );
    const [signUpInfo, setSignUpInfo] = React.useState({});

    React.useEffect(() => {
        if (isLogined) {
            setPage("content");
        }
    }, [isLogined]);
    return (
        <View style={styles.screen}>
            {page === "onboarding" && <OnboardingContent setPage={setPage} />}
            {page === "signupandsignin" && <SignupAndSigninContent setPage={setPage} signUpInfo={setSignUpInfo} />}
            {page === "success" && <Success title="Success" description="Your account has been created successfully!" />}
            {page === "verification" && <VereficationContent setPage={setPage} signUpInfo={signUpInfo} />}
            {page === "content" && (
                <ContentPage isLogined={isLogined} setIsLogined={setIsLogined} />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: colors.background,
        marginVertical: 25,
        marginHorizontal: 16,
    },
});