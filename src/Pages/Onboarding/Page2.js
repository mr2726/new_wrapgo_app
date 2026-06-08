import {View, Text, StyleSheet, Image} from 'react-native';
import React from 'react';
// Components
import {LOGO} from '../../components/ui/LOGO';
import {colors, spacing, typography} from '../../styles/theme';


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
        fontSize: typography.size2xl,
        fontWeight: typography.weightMedium,
        color: colors.textPrimary,
    },
    logo: {
        marginLeft: spacing.lg,
        marginTop: 50,
    },
    TextContainer: {
        position: 'absolute',
        bottom: spacing.xl,
        left: 0,
        right: 0,
    },
    description: {
        fontSize: typography.sizeLg,
        color: colors.textSecondary,
        textAlign: 'left',
    },
});