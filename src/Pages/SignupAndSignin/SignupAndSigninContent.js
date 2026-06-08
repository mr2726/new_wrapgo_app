import React from 'react';
import {View, StyleSheet} from 'react-native';
import {colors} from '../../styles/theme';

// Pages Content Page
import Signup from './Signup';
import Signin from './Signin';
// ----------------------------

export default function SignupAndSigninContent({setPage}) {
    const [localPage, setLocalPage] = React.useState("signin");
    return (
        <View style={styles.screen}>
            {localPage === "signup" && <Signup setLocalPage={setLocalPage} setPage={setPage} />}
            {localPage === "signin" && <Signin setLocalPage={setLocalPage} setPage={setPage} />}
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