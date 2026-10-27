import {View, StyleSheet} from 'react-native';
import React from 'react';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
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
    const [authInitialScreen, setAuthInitialScreen] = React.useState('signup');

    const handleLogout = React.useCallback(() => {
        setIsLogined(false);
        setSignUpInfo({});
        setAuthInitialScreen('signin');
        setPage('signupandsignin');
    }, [setIsLogined]);

    const handleAccountDeleted = React.useCallback(() => {
        setIsLogined(false);
        setSignUpInfo({});
        setAuthInitialScreen('signup');
        setPage('onboarding');
    }, [setIsLogined]);

    React.useEffect(() => {
        if (isLogined) {
            setPage("content");
            setAuthInitialScreen('signup');
        }
    }, [isLogined]);

    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.screen, {
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
            paddingLeft: insets.left + 16,
            paddingRight: insets.right + 16,
        }]}>
            {page === "onboarding" && <OnboardingContent setPage={setPage} />}
            {page === "signupandsignin" && (
                <SignupAndSigninContent
                    setPage={setPage}
                    signUpInfo={setSignUpInfo}
                    initialLocalPage={authInitialScreen}
                />
            )}
            {page === "success" && <Success title="Success" description="Your account has been created successfully!" />}
            {page === "verification" && <VereficationContent setPage={setPage} signUpInfo={signUpInfo} />}
            {page === "content" && (
                <ContentPage
                    isLogined={isLogined}
                    setIsLogined={setIsLogined}
                    onLogout={handleLogout}
                    onAccountDeleted={handleAccountDeleted}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: colors.background,
    },
});