import {View, Text, StyleSheet} from 'react-native';
import React from 'react';
import {Feather} from '@expo/vector-icons';
import {colors, spacing, typography} from '../../styles/theme';
export default function Success({title, description}) {
    return (
        <View style={styles.screen}>
            <View style={{width: 80, height: 80, borderRadius: 40, backgroundColor: colors.accent, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.xl}}>
                <Feather name="check" size={45} color="black" />
            </View>
            <Text style={{color: colors.textPrimary, fontSize: typography.size2xl, fontWeight: typography.weightBold}}>{title}</Text>
            <Text style={{color: colors.textMuted, fontSize: typography.sizeMd, marginTop: spacing.sm + 2, width: 200, textAlign: 'center'}}>{description}</Text>
        </View>
    );
}




const styles = StyleSheet.create({
    screen: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
    },
});
