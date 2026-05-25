import {View, Text, Pressable} from 'react-native';
import React from 'react';

export const Button_ = ({title, onPress, style, dispable}) => {
  return (
    <Pressable      onPress={dispable ? null : onPress}
      style={({pressed}) => [
        {
            backgroundColor: pressed ? '#1F8C0B' : '#39FF14',
            padding: 10,
            borderRadius: 5,
            alignItems: 'center',
            justifyContent: 'center',
            width: "100%",
            height: 55,
            borderRadius: 55,
            transition: '0.3s',
            opacity: dispable ? 0.15 : 1,
        },
        style,
        dispable && {backgroundColor: '#ccc'},
        ]}>
        <Text style={{color: '#333', fontSize: 16}}>{title}</Text>
    </Pressable>
  );
}