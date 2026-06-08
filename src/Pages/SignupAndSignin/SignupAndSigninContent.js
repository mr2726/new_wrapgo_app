import {View, StyleSheet} from 'react-native';
import React from 'react';

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
        backgroundColor: '#040404',
        marginVertical: 25,
    },
});