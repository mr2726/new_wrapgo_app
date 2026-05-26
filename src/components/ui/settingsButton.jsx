import {View, Text, Pressable} from 'react-native';
import React from 'react';
import { Feather } from "@expo/vector-icons";

export const SettingsButton = ({title, onPress, icon}) => {
  return (
    <Pressable
        style={{
            backgroundColor: '#151515',
            padding: 15,
            borderRadius: 55,
            height: 55,
            width: '100%',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
        }}
        onPress={onPress}
    >
      
        <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
            <Feather name={icon || "settings"} size={20} color="#939393" />
            <Text style={{color: '#F5F5F5', fontSize: 16}}>{title}</Text>
        </View>
        <Feather name="arrow-right" size={20} color="#939393" />
    </Pressable>
  );
};