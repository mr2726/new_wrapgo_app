import {View, Text, StyleSheet} from 'react-native';
import React from 'react';

export default function Page3() {
    return (
        <View style={styles.screen}>
            <Text style={styles.text}>Page 3</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
});