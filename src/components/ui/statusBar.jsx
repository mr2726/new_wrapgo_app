import {View, Text, Pressable} from 'react-native';
import React from 'react';
import {Feather} from '@expo/vector-icons';


export const StatusBar_ = ({style, title, description, icon, color, onPress}) => {
    return (
        <View style={{width: '100%', backgroundColor: '#151515', paddingHorizontal: 15, height: 52, borderRadius: 8, display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 12, ...style}}>
            <View style={{display: 'flex', flexDirection: 'row', gap: 12}}>
                <Feather name={icon || "info"} size={13} color={color || "#939393"} />
                <View>
                    <Text style={{color: '#F5F5F5', fontSize: 12}}>{title}</Text>
                    <Text style={{color: '#939393', fontSize: 10}}>{description}</Text>
                </View>
            </View>
            {onPress ? (
                <Pressable style={{marginLeft: 'auto', padding: 8, borderRadius: 8, backgroundColor: '#151515'}} onPress={onPress}>
                    <Feather name="x" size={16} color="#939393" />
                </Pressable>
            ) : null}
        </View>
    );
}