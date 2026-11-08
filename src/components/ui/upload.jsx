import {ActivityIndicator, Text, Pressable, StyleSheet} from 'react-native';
import React from 'react';
import {colors, spacing, typography} from '../../styles/theme';
import {Feather} from '@expo/vector-icons';

export function UploadDocuments({insideText, onPress, style, icon = 'upload', disabled = false, loading = false}) {
    return (
        <Pressable
            onPress={onPress}
            disabled={disabled || loading}
            style={{
                width: '100%',
                padding: spacing.lg,
                backgroundColor: colors.border,
                borderRadius: 12,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: '#444444',
                paddingVertical: 55,
                opacity: disabled || loading ? 0.6 : 1,
                ...style,
            }}
        >
            {loading ? (
                <ActivityIndicator size="small" color={colors.accent} />
            ) : (
                <Feather name={icon} size={24} color={colors.accent} />
            )}
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