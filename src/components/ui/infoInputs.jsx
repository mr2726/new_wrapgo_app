import {View, Text, Pressable} from 'react-native';
import React from 'react';
import {Feather} from '@expo/vector-icons';

export const InfoInput_ = ({label, value, style, icon, onPress}) => {
  return (
    <Pressable style={{width: '100%', ...style}} onPress={onPress}>
        <Text style={{marginBottom: 5, color:'#939393', fontSize: 16}}>{label}</Text>
        <View style={{display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, backgroundColor: '#151515', paddingHorizontal: 15, borderRadius: 55, height: 46}}>
            <Text style={{color: '#939393', fontSize: 16}}>{value}</Text>
            <Feather name={icon || "arrow-right"} size={20} color="#939393" />
        </View>
    </Pressable>
  );
}