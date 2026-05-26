import {View, Text, Pressable} from 'react-native';
import React from 'react';

export const SegmentedControl_ = ({options, value, onValueChange, style}) => {
    return (
        <View style={{width: '100%', display: 'flex', flexDirection: 'column', gap: 4, ...style}}>
            <View style={{
                    width: '100%', 
                    backgroundColor: 'rgba(118, 118, 128, 0.12)', 
                    borderRadius: 32, 
                    height: 32,
                    display: 'flex', 
                    flexDirection: 'row', 
                    alignItems: 'center'
                }}>
                {options.map((option) => (
                    <Pressable key={option.value} onPress={() => onValueChange(option.value)} style={{
                        flex: 1, 
                        height: 32,
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        backgroundColor: value === option.value ? '#39ff14' : 'transparent', 
                        borderRadius: 32
                    }}>
                        <Text style={{color: value === option.value ? '#000' : '#f5f5f5', fontSize: 12}}>{option.label}</Text>
                    </Pressable>
                ))}
            </View>
        </View>
    );
}