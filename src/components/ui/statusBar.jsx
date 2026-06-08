import {View, Text, Pressable} from 'react-native';
import React from 'react';
import {Feather} from '@expo/vector-icons';
import {colors, radius, spacing, typography} from '../../styles/theme';


export const StatusBar_ = ({style, title, description, icon, color, onPress}) => {
    return (
        <View style={{width: '100%', backgroundColor: colors.surface, paddingHorizontal: spacing.lg - 1, height: 52, borderRadius: radius.md, display: 'flex', flexDirection: 'row', alignItems: 'center', gap: spacing.md, ...style}}>
            <View style={{display: 'flex', flexDirection: 'row', gap: spacing.md}}>
                <Feather name={icon || "info"} size={13} color={color || colors.textSecondary} />
                <View>
                    <Text style={{color: colors.textPrimary, fontSize: typography.sizeSm}}>{title}</Text>
                    <Text style={{color: colors.textSecondary, fontSize: typography.sizeXs}}>{description}</Text>
                </View>
            </View>
            {onPress ? (
                <Pressable style={{marginLeft: 'auto', padding: spacing.sm, borderRadius: radius.md, backgroundColor: colors.surface}} onPress={onPress}>
                    <Feather name="x" size={16} color={colors.textSecondary} />
                </Pressable>
            ) : null}
        </View>
    );
}