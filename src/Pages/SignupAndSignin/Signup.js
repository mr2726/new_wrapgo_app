import {View, Text, StyleSheet} from 'react-native';
import React from 'react';

import {TopControl} from '../../components/ui/topControl';

export default function Signup({setLocalPage}) {
    return (
        <View style={styles.screen}>
            <TopControl setLocalPage={setLocalPage} />
            <Text style={styles.text}>Signup</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
    },
});