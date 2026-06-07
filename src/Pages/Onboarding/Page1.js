import {View, Text, Image, StyleSheet} from 'react-native';
import React from 'react';

export default function Page1() {
    return (
        <View style={styles.screen}>
            <Image source={require('../../components/ui/imgs/W.png')} style={styles.image} />
            <View style={styles.TextContainer}>
                <Text style={styles.title}>Turn your Car Into{'\n'}Income</Text>
                <Text style={styles.description}>Drive as usual, earn while you move. No extra effort, just passive income.</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 50,
    },
    title: {
        fontSize: 24,
        fontWeight: '500',
        color: '#F5F5F5',
    },
    image: {
        position: 'absolute',
        top: -65,
        right: 0,
    },
    TextContainer: {
        position: 'absolute',
        bottom: 20,
        left: 0,
        right: 0,
    },
    description: {
        fontSize: 16,
        color: '#939393',
        textAlign: 'left',
        // marginTop: 8,
    },
});