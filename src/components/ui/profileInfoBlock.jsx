import {View, Text, StyleSheet, Image, Pressable} from "react-native";
import React from "react";
import { colors, radius, spacing, typography } from "../../styles/theme";

export const ProfileInfoBlock = ({title, value, description}) => {
    return (
        <View style={styles.infoBlock}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.value}>{value}</Text>
            <Text style={styles.description}>{description}</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    infoBlock: {
        width: "48%",
        marginBottom: spacing.md,
        backgroundColor: colors.surface,
        padding: spacing.md,
        borderRadius: radius.lg,
        justifyContent: "center",
    },
    title: {
        color: colors.textPrimary,
        fontSize: typography.sizeLg,
        fontFamily: typography.familyRegular,
    },
    value: {
        color: colors.accent,
        fontSize: typography.sizeLg,
        fontFamily: typography.familyMedium,
        marginTop: spacing.sm,
    },
    description: {
        color: colors.textSecondary,
        fontSize: typography.sizeSm,
        fontFamily: typography.familyRegular,
        marginTop: spacing.sm,
    }
});