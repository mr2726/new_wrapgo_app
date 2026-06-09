import {View, Text} from 'react-native';
import React from 'react';
import {colors, typography} from '../../styles/theme';

export const LOGO = () => {
    return (
        <View>
            <Text style={{color: colors.textPrimary, fontSize: typography.size2xl, fontFamily: typography.familyBold}}>
                <Text style={{color: colors.textPrimary, fontFamily: typography.familyBold}}>Wrap</Text>
                <Text style={{color: colors.accent, fontFamily: typography.familyBold}}>Go</Text>
            </Text>
        </View>
    );
}