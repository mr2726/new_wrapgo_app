import {Pressable} from 'react-native';
import React from 'react';
import {Feather} from '@expo/vector-icons';
import {LinearGradient} from 'expo-linear-gradient';
import {colors} from '../../styles/theme';

export const InfoButton_ = ({icon, onPress}) => {
    return (
        <Pressable onPress={onPress} style={
            {
                width: 46,
                height: 46,
                borderRadius: 23,
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }
        }>
            <LinearGradient
                colors={['rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 0.05)']}
                // locations={[0, 0.45, 1]}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
                style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: 23,
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                <Feather name={icon || "info"} size={16} color={colors.textSecondary} />
            </LinearGradient>
        </Pressable>
    );
}