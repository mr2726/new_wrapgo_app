import {View, Text, StyleSheet, Image} from 'react-native';
import React from 'react';
// Components
import {LOGO} from '../../components/ui/LOGO';


export default function Page2() {
    return (
        <View style={styles.screen}>
            <View style={styles.logo}>
                <LOGO />
            </View>
            <View style={styles.TextContainer}>
                <Image style={{marginBottom: 20, width: '100%'}} source={require('../../components/ui/imgs/onb_chart.png')} resizeMode="contain" />
                <Text style={styles.title}>Get Paid Per Kilometer with <LOGO /></Text>
                <Text style={styles.description}>Track your earnings in real-time.The more you drive, the more you earn.</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        marginBottom: 50,
    },
    title: {
        fontSize: 24,
        fontWeight: '500',
        color: '#F5F5F5',
    },
    logo: {
        marginLeft: 16,
        marginTop: 50,
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
    },
});