import React from 'react';
import {View, StyleSheet} from 'react-native';
import {colors} from '../../styles/theme';

// Pages Content Page
import Signup from './Signup';
import Signin from './Signin';
import OTPScreen from './OTP/OTPScreen';
// ----------------------------

export default function SignupAndSigninContent({setPage, signUpInfo, initialLocalPage = 'signup'}) {
    const [localPage, setLocalPage] = React.useState(initialLocalPage); // signup | signin | otp

    React.useEffect(() => {
        setLocalPage(initialLocalPage);
    }, [initialLocalPage]);

    return (
        <View style={styles.screen}>
            {localPage === "signup" && <Signup setLocalPage={setLocalPage} setPage={setPage} signUpInfo={signUpInfo} />}
            {localPage === "signin" && <Signin setLocalPage={setLocalPage} setPage={setPage} />}
            {localPage === "otp" && <OTPScreen setLocalPage={setLocalPage} setPage={setPage} />}
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: colors.background,
        marginVertical: 25,
    },
});