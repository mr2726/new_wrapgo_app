import {View, Text, StyleSheet} from "react-native";
import React from "react";
import { colors, radius, spacing, typography } from "../../styles/theme";

export const StatsInfo = ({title, value, description, rightText}) => {
    const numericValue = Number(value) || 0;
    const progressPercent = Math.max(0, Math.min(100, numericValue));

    return (
        <View style={styles.valueContainer}>
            <Text style={styles.blockTitle}>{title}</Text>
            <View style={styles.loaderValueContainer}>
                <View style={styles.valueBlock}>
                    <View style={[styles.loaderValue, {width: `${progressPercent}%`}]}></View>
                </View>
            </View>
            <View style={{display: "flex", flexDirection: "row", justifyContent: "space-between"}}>
                <Text style={styles.description}>{description}</Text>
                <Text style={styles.value}>{rightText || `${progressPercent.toFixed(0)}%`}</Text>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    loaderValue: {
        backgroundColor: colors.accent,
        height: 4,
        borderRadius: radius.sm,
    },
    title: {
        fontSize: typography.sizeLg,
        fontFamily: typography.familyMedium,
        color: colors.textPrimary,
    },
    valueContainer: {
        backgroundColor: colors.surface,
        padding: spacing.md,
        borderRadius: radius.lg,
        marginTop: spacing.xl,
    },
    blockTitle: {
        fontSize: typography.sizeLg,
        fontFamily: typography.familyMedium,
        color: colors.textSecondary,
    },
    valueBlock: {
        backgroundColor: colors.loaderBG,
        height: 4,
        borderRadius: radius.sm,
    },
    loaderValueContainer: {
        height: 26,
        backgroundColor: colors.surfaceMuted,
        borderRadius: radius.pill,
        marginTop: spacing.xl,
        display: "flex",
        justifyContent: "center",
        marginBottom: spacing.md,
        paddingHorizontal: spacing.xl,
    },
    value: {
        fontSize: typography.sizeSm,
        fontFamily: typography.familyRegular,
        color: colors.textSecondary,
        marginTop: spacing.sm,
    },
    description: {
        fontSize: typography.sizeSm,
        fontFamily: typography.familyRegular,
        color: colors.textSecondary,
        marginTop: spacing.sm,
    }
});