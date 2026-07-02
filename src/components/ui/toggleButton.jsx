import {View, Pressable, Animated, Easing} from 'react-native';
import React from 'react';
import {colors, spacing} from '../../styles/theme';

const THUMB_SIZE = 24;
const TRACK_WIDTH = 52;
const TRACK_HEIGHT = 32;
const PADDING = 4;
const TRAVEL = TRACK_WIDTH - THUMB_SIZE - PADDING * 2;

export const ToggleButton_ = ({onPress, dispable, style}) => {
    const [isOn, setIsOn] = React.useState(false);
    const animation = React.useRef(new Animated.Value(0)).current;

    const handlePress = () => {
        if (dispable) return;
        const nextValue = !isOn;
        setIsOn(nextValue);
        if (onPress) onPress(nextValue);
        Animated.timing(animation, {
            toValue: nextValue ? 1 : 0,
            duration: 220,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: false,
        }).start();
    };

    const translateX = animation.interpolate({
        inputRange: [0, 1],
        outputRange: [0, TRAVEL],
    });

    const thumbColor = animation.interpolate({
        inputRange: [0, 1],
        outputRange: [colors.textMuted, colors.accent],
    });

    return (
        <Pressable
            onPress={handlePress}
            disabled={dispable}
            style={{
                width: TRACK_WIDTH,
                height: TRACK_HEIGHT,
                borderRadius: TRACK_HEIGHT / 2,
                backgroundColor: colors.surface,
                justifyContent: 'center',
                padding: PADDING,
                opacity: dispable ? 0.5 : 1,
                ...style,
            }}
        >
            <Animated.View style={{
                width: THUMB_SIZE,
                height: THUMB_SIZE,
                borderRadius: THUMB_SIZE / 2,
                backgroundColor: thumbColor,
                transform: [{translateX}],
            }} />
        </Pressable>
    );
}