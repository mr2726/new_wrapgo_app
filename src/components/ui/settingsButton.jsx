import {View, Text, Pressable} from 'react-native';
import React from 'react';
import { Feather } from "@expo/vector-icons";
import {colors, radius, spacing, typography} from '../../styles/theme';

export const SettingsButton = ({title, onPress, icon}) => {
  return (
    <Pressable
        style={{
          backgroundColor: colors.surface,
          paddingHorizontal: spacing.lg - 1,
          borderRadius: radius.pill,
            height: 46,
            width: '100%',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
        }}
        onPress={onPress}
    >
      
        <View style={{flexDirection: 'row', alignItems: 'center', gap: spacing.sm}}>
          <Feather name={icon || "settings"} size={20} color={colors.textSecondary} />
          <Text style={{color: colors.textPrimary, fontSize: typography.sizeLg}}>{title}</Text>
        </View>
        <Feather name="arrow-right" size={20} color={colors.textSecondary} />
    </Pressable>
  );
};