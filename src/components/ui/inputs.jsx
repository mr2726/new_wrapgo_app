import {TextInput, View, Text, Pressable} from 'react-native';
import React from 'react';
import {useState} from 'react';
import { LuEyeClosed, LuEye } from "react-icons/lu";
import { Feather } from '@expo/vector-icons';

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
  }) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisibleState, setIsPasswordVisibleState] = useState(false);
  const isActive = isFocused;
  const hasError = Boolean(error);
  const resolvedErrorText =
    typeof error === 'string' ? error : errorText || 'Input error';

  const inputStateStyle = hasError
    ? {
        borderColor: '#E53935',
      }
    : isActive
      ? {
          borderColor: '#39ff14',
        }
      : null;

  const labelText = label;
  const renderedIcon =
    typeof icon === 'function' ? icon({isActive, error}) : icon;

  return (
    <View style={{width: '100%', marginVertical: 4}}>
      {labelText && (
        <Text
          style={{
            marginBottom: 5,
            color: hasError ? '#E53935' : !isActive ? '#939393' : '#fff',
            fontSize: 16,
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
              borderColor: '#151515',
              paddingHorizontal: 15,
              paddingLeft: renderedIcon ? 45 : 15,
              paddingRight: isPassword ? 45 : 15,
              borderRadius: 55,
              width: '100%',
              height: 55,
              backgroundColor: '#151515',
              color: '#fff',
            },
            inputStateStyle,
            style,
          ]}
          secureTextEntry={Boolean(isPassword) && !isPasswordVisibleState}
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
              <Feather name="eye" color="#626262" size={20} />
            ) : (
              <Feather name="eye-off" color="#626262" size={20} />
            )}
          </Pressable>
        )}
      </View>

      {hasError && (
        <Text
          style={{
            width: '100%',
            color: '#E53935',
            marginTop: 6,
            textAlign: 'right',
            fontSize: 13,
          }}>
          {resolvedErrorText}
        </Text>
      )}
    </View>
  );
}