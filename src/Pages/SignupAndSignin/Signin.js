import {View, Text, StyleSheet} from 'react-native';
import React from 'react';

export default function Signin() {
    return (
        <View style={styles.screen}>
            <Text>Signin</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});