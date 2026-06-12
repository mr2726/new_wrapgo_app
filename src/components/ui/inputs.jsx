import {TextInput, View, Text, Pressable} from 'react-native';
import React from 'react';
import {useState} from 'react';
import { Feather } from '@expo/vector-icons';
import {colors, radius, spacing, typography} from '../../styles/theme';

export const Input_ = ({
  placeholder,
  value,
  onChangeText,
  style,
  label,
  error,
  onFocus,
  onBlur,
  errorText,
  icon,
  isPassword,
  disable = true,
  }) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisibleState, setIsPasswordVisibleState] = useState(false);
  const isActive = isFocused;
  const hasError = Boolean(error);
  const resolvedErrorText =
    typeof error === 'string' ? error : errorText || 'Input error';

  const inputStateStyle = hasError
    ? {
        borderColor: colors.error,
      }
    : isActive
      ? {
          borderColor: colors.accent,
        }
      : null;

  const labelText = label;
  const renderedIcon =
    typeof icon === 'function' ? icon({isActive, error}) : icon;
  const [disableInput, setDisableInput] = useState(disable);
  return (
    <View style={{width: '100%', marginVertical: 4}}>
      {labelText && (
        <Text
          style={{
            marginBottom: 5,
            color: hasError ? colors.error : !isActive ? colors.textSecondary : colors.textPrimary,
            fontSize: typography.sizeLg,
            fontFamily: typography.familyRegular,
          }}>
          {labelText}
        </Text>
      )}

      <View style={{position: 'relative', width: '100%'}}>
        {renderedIcon && (
          <View
            style={{
              position: 'absolute',
              left: 15,
              top: 0,
              height: 55,
              justifyContent: 'center',
              zIndex: 1,
            }}>
            {renderedIcon}
          </View>
        )}

        <TextInput
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          onFocus={event => {
            setIsFocused(true);
            onFocus?.(event);
          }}
          onBlur={event => {
            setIsFocused(false);
            onBlur?.(event);
          }}
          style={[
            {
              borderWidth: 1,
              borderColor: colors.border,
              paddingHorizontal: spacing.lg - 1,
              paddingLeft: renderedIcon ? 45 : 15,
              paddingRight: isPassword ? 45 : 15,
              borderRadius: radius.pill,
              width: '100%',
              height: 55,
              backgroundColor: colors.surface,
              color: colors.textPrimary,
              fontFamily: typography.familyRegular,
            },
            inputStateStyle,
            style,
          ]}
          secureTextEntry={Boolean(isPassword) && !isPasswordVisibleState}
          editable={disableInput}
        />

        {isPassword && (
          <Pressable
            onPress={() => setIsPasswordVisibleState(prev => !prev)}
            style={{
              position: 'absolute',
              right: 15,
              top: 0,
              height: 55,
              justifyContent: 'center',
              zIndex: 1,
            }}>
            {isPasswordVisibleState ? (
              <Feather name="eye" color={colors.textMuted} size={20} />
            ) : (
              <Feather name="eye-off" color={colors.textMuted} size={20} />
            )}
          </Pressable>
        )}
        {
          !disableInput && (
            <Pressable onPress={() => setDisableInput(true)}
              style={{
                position: 'absolute',
                right: 15,
                top: 0,
                height: 55,
                justifyContent: 'center',
                zIndex: 1,
              }}
            >
              <Feather name="edit" color={colors.textMuted} size={20} />
            </Pressable>
          )
        }
      </View>

      {hasError && (
        <Text
          style={{
            width: '100%',
            color: colors.error,
            marginTop: 6,
            textAlign: 'right',
            fontSize: typography.sizeSm + 1,
            fontFamily: typography.familyRegular,
          }}>
          {resolvedErrorText}
        </Text>
      )}
    </View>
  );
}