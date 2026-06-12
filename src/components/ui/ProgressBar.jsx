import {View, StyleSheet} from 'react-native';
import React from 'react';
import {colors, spacing} from '../../styles/theme';

export const ProgressBar = ({step, activeStep}) => {
    const safeStep = Math.max(0, Number(step) || 0);
    return (
        <View style={styles.container}>
            {Array.from({length: safeStep}).map((_, index) => (
                <View key={index} style={[styles.progress, activeStep===index ?{backgroundColor: colors.accent} : {}]} />
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: 5,
        flexDirection: 'row',
        borderRadius: 5,
        marginBottom: spacing.lg,
    },
    progress: {
        height: '100%',
        flex: 1,
        backgroundColor: colors.surface,
        borderRadius: 5,
    },
});