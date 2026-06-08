import {View, Text, Pressable} from 'react-native';
import React from 'react';
import {Feather} from '@expo/vector-icons';
import {colors, radius, spacing, typography} from '../../styles/theme';

export const InfoInput_ = ({label, value, style, icon, onPress}) => {
  return (
    <Pressable style={{width: '100%', ...style}} onPress={onPress}>
      <Text style={{marginBottom: 5, color: colors.textSecondary, fontSize: typography.sizeLg}}>{label}</Text>
      <View style={{display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm, backgroundColor: colors.surface, paddingHorizontal: spacing.lg - 1, borderRadius: radius.pill, height: 46}}>
        <Text style={{color: colors.textSecondary, fontSize: typography.sizeLg}}>{value}</Text>
        <Feather name={icon || "arrow-right"} size={20} color={colors.textSecondary} />
        </View>
    </Pressable>
  );
}