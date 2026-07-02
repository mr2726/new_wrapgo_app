import {View, Text, Pressable, StyleSheet} from 'react-native';
import React from 'react';
import {colors, spacing, typography} from '../../styles/theme';
import {Feather} from '@expo/vector-icons';

export function UploadDocuments({insideText, onPress, style}) {
    return (
        <Pressable
            onPress={onPress}
            style={{
                width: '100%',
                padding: spacing.lg,
                backgroundColor: colors.border,
                borderRadius: 12,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: '#444444',
                paddingVertical: 55,
                ...style,
            }}
        >
            <Feather name="upload" size={24} color={colors.accent} />
            <Text style={styles.text}>{insideText}</Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    text: {
        color: colors.textPrimary,
        fontSize: typography.sizeMd,
        marginTop: spacing.sm,
        fontFamily: typography.familyRegular,
        textAlign: 'center',
    },
});