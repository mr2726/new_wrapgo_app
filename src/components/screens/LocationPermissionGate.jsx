import {ActivityIndicator, StyleSheet, Text, View} from 'react-native';
import React from 'react';

import {Button_} from '../ui/buttons';
import {colors, radius, spacing, typography} from '../../styles/theme';

const buildGateCopy = (status, errorMessage) => {
    if (!status) {
        return {
            title: 'Preparing location tracking',
            description: 'WrapGo is checking location permissions, GPS services, and the background task state.',
            details: errorMessage || '',
            retryLabel: 'Checking...',
        };
    }

    if (!status.taskManagerAvailable || !status.backgroundLocationAvailable) {
        return {
            title: 'Background tracking needs a dev or production build',
            description: 'Expo background location does not run fully inside Expo Go. Use a development build or a standalone binary for continuous tracking.',
            details: errorMessage || 'Rebuild the app after adding expo-location and expo-task-manager native configuration.',
            retryLabel: 'Check build again',
        };
    }

    if (!status.hasForegroundPermission) {
        return {
            title: 'Foreground location permission is required',
            description: 'WrapGo needs foreground location access before it can request continuous background tracking.',
            details: errorMessage || 'Grant precise location access so the app can start and maintain driver tracking.',
            retryLabel: 'Grant foreground access',
        };
    }

    if (!status.hasBackgroundPermission) {
        return {
            title: 'Background location permission is required',
            description: 'WrapGo needs background location access to keep sending GPS updates while the app is minimized or the screen is locked.',
            details: errorMessage || 'If iOS previously granted Allow Once, open Settings and switch Location access to Always. On Android 11+, the system may open Settings for the background permission step.',
            retryLabel: 'Grant background access',
        };
    }

    if (!status.servicesEnabled) {
        return {
            title: 'Turn on device location services',
            description: 'WrapGo cannot start foreground or background tracking until GPS and device location services are enabled.',
            details: errorMessage || 'After enabling location services on the device, come back and retry.',
            retryLabel: 'I enabled location services',
        };
    }

    return {
        title: 'Location tracking could not start',
        description: 'WrapGo has the required permissions, but the background location task is not running yet.',
        details: errorMessage || 'Retry to register the task and foreground service again.',
        retryLabel: 'Start tracking again',
    };
};

export default function LocationPermissionGate({
    busy,
    errorMessage,
    onOpenSettings,
    onRetry,
    status,
}) {
    const copy = React.useMemo(
        () => buildGateCopy(status, errorMessage),
        [errorMessage, status]
    );

    return (
        <View style={styles.screen}>
            <View style={styles.card}>
                <Text style={styles.eyebrow}>Continuous location tracking</Text>
                <Text style={styles.title}>{copy.title}</Text>
                <Text style={styles.description}>{copy.description}</Text>
                {!!copy.details && <Text style={styles.details}>{copy.details}</Text>}

                <View style={styles.actions}>
                    <Button_
                        title={busy ? 'Working...' : copy.retryLabel}
                        onPress={onRetry}
                        dispable={busy}
                    />
                    <Button_
                        title="Open Settings"
                        onPress={onOpenSettings}
                        dispable={busy}
                        style={styles.secondaryButton}
                    />
                </View>

                {busy && (
                    <View style={styles.loaderRow}>
                        <ActivityIndicator color={colors.accent} />
                        <Text style={styles.loaderText}>
                            Waiting for the latest permission and task status.
                        </Text>
                    </View>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: spacing.lg,
        backgroundColor: colors.background,
    },
    card: {
        width: '100%',
        backgroundColor: colors.surface,
        borderRadius: radius.lg,
        padding: spacing.xxl,
        borderWidth: 1,
        borderColor: colors.surfaceMuted,
        gap: spacing.md,
    },
    eyebrow: {
        color: colors.accent,
        fontFamily: typography.familyMedium,
        fontSize: typography.sizeSm,
        textTransform: 'uppercase',
        letterSpacing: 0.6,
    },
    title: {
        color: colors.textPrimary,
        fontFamily: typography.familyBold,
        fontSize: typography.size2xl,
        lineHeight: 30,
    },
    description: {
        color: colors.textPrimary,
        fontFamily: typography.familyRegular,
        fontSize: typography.sizeLg,
        lineHeight: 24,
    },
    details: {
        color: colors.textSecondary,
        fontFamily: typography.familyRegular,
        fontSize: typography.sizeMd,
        lineHeight: 22,
    },
    actions: {
        marginTop: spacing.sm,
        gap: spacing.md,
    },
    secondaryButton: {
        backgroundColor: colors.surfaceMuted,
    },
    loaderRow: {
        marginTop: spacing.sm,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    loaderText: {
        color: colors.textSecondary,
        fontFamily: typography.familyRegular,
        fontSize: typography.sizeSm,
    },
});