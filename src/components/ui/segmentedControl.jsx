import {View, Text, Pressable, Animated, Easing} from 'react-native';
import React from 'react';
import {colors, radius, typography} from '../../styles/theme';

export const SegmentedControl_ = ({options, value, onValueChange, style}) => {
    const [containerWidth, setContainerWidth] = React.useState(0);
    const selectedIndex = Math.max(
        0,
        options.findIndex((option) => option.value === value)
    );
    const translateX = React.useRef(new Animated.Value(0)).current;

    const segmentWidth = options.length > 0 ? containerWidth / options.length : 0;

    React.useEffect(() => {
        if (!segmentWidth) return;

        Animated.timing(translateX, {
            toValue: selectedIndex * segmentWidth,
            duration: 220,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
        }).start();
    }, [segmentWidth, selectedIndex, translateX]);

    return (
        <View style={{width: '100%', display: 'flex', flexDirection: 'column', gap: 4, ...style}}>
            <View style={{
                    width: '100%', 
                    backgroundColor: 'rgba(118, 118, 128, 0.12)', 
                    borderRadius: 32, 
                    height: 32,
                    display: 'flex', 
                    flexDirection: 'row', 
                    alignItems: 'center',
                    position: 'relative',
                    overflow: 'hidden'
                }}
                onLayout={(event) => {
                    setContainerWidth(event.nativeEvent.layout.width);
                }}>
                {segmentWidth > 0 && (
                    <Animated.View
                        pointerEvents="none"
                        style={{
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            width: segmentWidth,
                            height: 32,
                            backgroundColor: colors.accent,
                            borderRadius: radius.full,
                            transform: [{translateX}],
                        }}
                    />
                )}
                {options.map((option) => (
                    <Pressable key={option.value} onPress={() => onValueChange(option.value)} style={{
                        flex: 1, 
                        height: 32,
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        backgroundColor: 'transparent', 
                        zIndex: 1,
                        borderRadius: radius.full
                    }}>
                        <Text style={{color: value === option.value ? colors.black : colors.textPrimary, fontSize: typography.sizeSm, fontFamily: typography.familyMedium}}>{option.label}</Text>
                    </Pressable>
                ))}
            </View>
        </View>
    );
}