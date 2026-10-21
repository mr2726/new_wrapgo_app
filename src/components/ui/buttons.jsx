import {ActivityIndicator, Text, Pressable} from 'react-native';
import React from 'react';
import {colors, radius, spacing, typography} from '../../styles/theme';

export const Button_ = ({title, onPress, style, dispable, disabled, loading = false}) => {
  const [isPressed, setIsPressed] = React.useState(false);
  const isDisabled = Boolean(dispable || disabled || loading || isPressed);

  const handlePress = async () => {
    if (isDisabled || typeof onPress !== 'function') return;

    setIsPressed(true);
    try {
      await onPress();
    } finally {
      setIsPressed(false);
    }
  };

  return (
    <Pressable      onPress={handlePress}
      disabled={isDisabled}
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
            opacity: isDisabled ? 0.6 : 1,
        },
        style,
        isDisabled && {backgroundColor: colors.accentDisabled},
        ]}>
        {loading || isPressed || dispable || disabled ? (
          <ActivityIndicator color={colors.textOnAccent} />
        ) : (
          <Text style={{color: colors.textOnAccent, fontSize: typography.sizeLg, fontFamily: typography.familyMedium}}>{title}</Text>
        )}
    </Pressable>
  );
}