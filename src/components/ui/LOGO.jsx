import {View, Text} from 'react-native';
import React from 'react';

export const LOGO = () => {
    return (
        <View>
            <Text style={{color: '#fff', fontSize: 24, fontWeight: 'bold'}}>
                <Text style={{color: '#F5F5F5'}}>Wrap</Text>
                <Text style={{color: '#39FF14'}}>Go</Text>
            </Text>
        </View>
    );
}