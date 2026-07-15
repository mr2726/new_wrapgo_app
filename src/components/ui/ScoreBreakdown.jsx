import {View, Text, StyleSheet, Image, Pressable} from "react-native";
import React from "react";
import { colors, radius, spacing, typography } from "../../styles/theme";
import { Feather } from "@expo/vector-icons";

export function ScoreBreakdown({safety, acceptance, activity}) {
    const score = Math.round((safety + acceptance + activity) / 3);
    return (
        <View style={styles.scoreContainer}>
            <Text style={styles.scoreTitle}>Score Breakdown</Text>
            <View>
                <View style={styles.loaderBlock}>
                    <View style={styles.loaderBG}>
                        <View style={[styles.loader, {width: `${safety}%`}]}></View>
                    </View>
                </View>
                <View style={{display:"flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center"}}>
                    <Text style={styles.loaderLabel}>Safety</Text>
                    <Text style={styles.loaderValue}>{safety}%</Text>
                </View>
            </View>

            <View>
                <View style={styles.loaderBlock}>
                    <View style={styles.loaderBG}>
                        <View style={[styles.loader, {width: `${acceptance}%`}]}></View>
                    </View>
                </View>
                <View style={{display:"flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center"}}>
                    <Text style={styles.loaderLabel}>Acceptance</Text>
                    <Text style={styles.loaderValue}>{acceptance}%</Text>
                </View>
            </View>

            <View>
                <View style={styles.loaderBlock}>
                    <View style={styles.loaderBG}>
                        <View style={[styles.loader, {width: `${activity}%`}]}></View>
                    </View>
                </View>
                <View style={{display:"flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center"}}>
                    <Text style={styles.loaderLabel}>Activity</Text>
                    <Text style={styles.loaderValue}>{activity}%</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    scoreContainer: {
        backgroundColor: colors.surface,
        borderRadius: radius.md,
        padding: spacing.md,
    },
    scoreTitle:{
        fontFamily: typography.familyRegular,
        fontSize: typography.sizeLg,
        color: colors.textPrimary,
        marginBottom: spacing.sm,
    },
    loaderBlock: {
        width: "100%",
        height: 26,
        backgroundColor: colors.surfaceMuted,
        borderRadius: radius.md,
        marginTop: spacing.sm,
        paddingHorizontal: spacing.sm,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    loaderBG:{
        backgroundColor: colors.loaderBG,
        height: 4,
        width: "100%",
        borderRadius: radius.md,
    },
    loader: {
        backgroundColor: colors.accent,
        height: 4,
        borderRadius: radius.md,
    },
    loaderLabel: {
        fontFamily: typography.familyRegular,
        fontSize: typography.sizeSm,
        color: colors.textSecondary,
        marginTop: spacing.xs,
    },
    loaderValue: {
        fontFamily: typography.familyRegular,
        fontSize: typography.sizeSm,
        color: colors.accent,
        marginTop: spacing.xs,
    }
});