import {View, Text} from 'react-native';
import React from 'react';
import {colors, typography} from '../../styles/theme';

export const LOGO = () => {
    return (
        <View>
            <Text style={{color: colors.textPrimary, fontSize: typography.size2xl, fontWeight: typography.weightBold}}>
                <Text style={{color: colors.textPrimary}}>Wrap</Text>
                <Text style={{color: colors.accent}}>Go</Text>
            </Text>
        </View>
    );
}