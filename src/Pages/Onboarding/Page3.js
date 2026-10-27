import {View, Text, StyleSheet, Image} from 'react-native';
import React from 'react';
// Components
import {LOGO} from '../../components/ui/LOGO';
import {colors, spacing, typography} from '../../styles/theme';


export default function Page3() {
    return (
        <View style={styles.screen}>
            <View style={styles.logo}>
                <LOGO />
            </View>
            <View style={styles.TextContainer}>
                <Image style={styles.chart} source={require('../../components/ui/imgs/onb_lastchart.png')} resizeMode="contain" />
                <Text style={styles.title}>Track Your Weekly{'\n'}Performance</Text>
                <Text style={styles.description}>Monitor performance, manage contracts, and optimize your earnings.</Text>
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
        fontFamily: typography.familyMedium,
        color: colors.textPrimary,
    },
    logo: {
        marginLeft: spacing.lg,
        marginTop: 50,
    },
    TextContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        paddingBottom: spacing.xl,
        minHeight: 0,
    },
    chart: {
        width: '100%',
        flexShrink: 1,
        minHeight: 0,
        maxHeight: 287,
        marginBottom: 20,
    },
    description: {
        fontSize: typography.sizeLg,
        color: colors.textSecondary,
        fontFamily: typography.familyRegular,
        textAlign: 'left',
    },
});