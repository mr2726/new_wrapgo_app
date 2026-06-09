import {View, Text, Image, StyleSheet} from 'react-native';
import React from 'react';
import {colors, spacing, typography} from '../../styles/theme';

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
        fontSize: typography.size2xl,
        fontFamily: typography.familyMedium,
        color: colors.textPrimary,
    },
    image: {
        position: 'absolute',
        top: -65,
        right: 0,
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
        fontFamily: typography.familyRegular,
        textAlign: 'left',
        // marginTop: 8,
    },
});