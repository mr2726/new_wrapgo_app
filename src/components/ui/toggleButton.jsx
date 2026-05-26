import {View, Pressable} from 'react-native';
import React from 'react';

export const ToggleButton_ = ({onPress, dispable, style}) => {
    const [isOn, setIsOn] = React.useState(false);

    const handlePress = () => {
        if (dispable) return;
        if (onPress) onPress(!isOn);
        setIsOn(!isOn);
    };
    return (
        <Pressable onPress={handlePress} style={
            {
                width: 52,
                height: 32,
                borderRadius: 16,
                backgroundColor: '#151515',
                display: 'flex',
                alignItems: isOn ? 'flex-end' : 'flex-start',
                justifyContent: 'center',
                padding: 4,
                opacity: dispable ? 0.5 : 1,
                ...style,
            }
        } disabled={dispable}>
            <View style={{
                width: 24,
                height: 24,
                borderRadius: 12,
                backgroundColor: isOn ? '#39ff14' : '#626262',
            }} />
        </Pressable>
    );
}