import React from 'react';
import {View, Text, StyleSheet, Pressable, ActivityIndicator} from 'react-native';
import {Feather} from '@expo/vector-icons';
import BottomSheet from './BottomSheet';
import {colors, spacing, typography} from '../../styles/theme';

const ActionRow = ({icon, title, onPress, danger = false, disabled = false}) => {
    return (
        <Pressable
            onPress={onPress}
            disabled={disabled}
            style={({pressed}) => [
                styles.row,
                pressed && !disabled && styles.rowPressed,
                disabled && styles.rowDisabled,
            ]}
        >
            <Feather
                name={icon}
                size={20}
                color={danger ? colors.error : colors.textPrimary}
            />
            <Text style={[styles.rowText, danger && styles.rowTextDanger]}>{title}</Text>
        </Pressable>
    );
};

export const ProfilePhotoSheet = ({
    visible,
    onClose,
    onChooseFromLibrary,
    onTakePhoto,
    onRemovePhoto,
    hasPhoto,
    loading,
}) => {
    return (
        <BottomSheet
            visible={visible}
            onClose={onClose}
            height={260}
        >
            <View style={styles.content}>
                {loading ? (
                    <View style={styles.loaderContainer}>
                        <ActivityIndicator size="small" color={colors.accent} />
                        <Text style={styles.loadingText}>Updating photo...</Text>
                    </View>
                ) : (
                    <>
                        <ActionRow
                            icon="image"
                            title="Choose from library"
                            onPress={onChooseFromLibrary}
                        />
                        <ActionRow
                            icon="camera"
                            title="Take photo"
                            onPress={onTakePhoto}
                        />
                        <ActionRow
                            icon="trash-2"
                            title="Remove current photo"
                            onPress={onRemovePhoto}
                            danger
                            disabled={!hasPhoto}
                        />
                    </>
                )}
            </View>
        </BottomSheet>
    );
};

const styles = StyleSheet.create({
    content: {
        flex: 1,
        paddingHorizontal: spacing.xl,
        paddingBottom: spacing.xl,
        gap: spacing.sm,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        borderRadius: 12,
        paddingVertical: spacing.lg,
        paddingHorizontal: spacing.md,
        backgroundColor: 'transparent',
    },
    rowPressed: {
        backgroundColor: colors.surface,
    },
    rowDisabled: {
        opacity: 0.45,
    },
    rowText: {
        color: colors.textPrimary,
        fontSize: typography.sizeLg,
        fontFamily: typography.familyRegular,
    },
    rowTextDanger: {
        color: colors.error,
    },
    loaderContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.md,
    },
    loadingText: {
        color: colors.textSecondary,
        fontSize: typography.sizeMd,
        fontFamily: typography.familyRegular,
    },
});
