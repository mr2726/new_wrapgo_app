import {View, StyleSheet} from 'react-native';
import React from 'react';

// Pages Content Page
import OnboardingContent from './Onboarding/OnboardingContent';
// ------------------------------------------------------------------------

export default function Content() {

    return (
        <View style={styles.screen}>
            <OnboardingContent />
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