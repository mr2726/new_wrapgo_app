import {View, Text, Pressable} from 'react-native';
import React from 'react';
import {colors, radius, typography} from '../../styles/theme';

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
                        backgroundColor: value === option.value ? colors.accent : 'transparent', 
                        borderRadius: radius.full
                    }}>
                        <Text style={{color: value === option.value ? colors.black : colors.textPrimary, fontSize: typography.sizeSm}}>{option.label}</Text>
                    </Pressable>
                ))}
            </View>
        </View>
    );
}