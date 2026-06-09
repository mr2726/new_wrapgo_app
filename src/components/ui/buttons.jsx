import {View, Text, Pressable} from 'react-native';
import React from 'react';
import {colors, radius, spacing, typography} from '../../styles/theme';

export const Button_ = ({title, onPress, style, dispable}) => {
  return (
    <Pressable      onPress={dispable ? null : onPress}
      style={({pressed}) => [
        {
            backgroundColor: pressed ? colors.accentPressed : colors.accent,
            padding: spacing.sm + 2,
            alignItems: 'center',
            justifyContent: 'center',
            width: "100%",
            height: 55,
            borderRadius: radius.pill,
            transition: '0.3s',
            opacity: dispable ? 0.15 : 1,
        },
        style,
        dispable && {backgroundColor: colors.accentDisabled},
        ]}>
        <Text style={{color: colors.textOnAccent, fontSize: typography.sizeLg, fontFamily: typography.familyMedium}}>{title}</Text>
    </Pressable>
  );
}