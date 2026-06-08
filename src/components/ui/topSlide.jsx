import {View, StyleSheet, Animated, Easing} from 'react-native';
import React from 'react';
import {colors, radius, spacing} from '../../styles/theme';

export function TopSlide({slidePage}) {
    const translateX = React.useRef(new Animated.Value(slidePage * 50)).current;

    React.useEffect(() => {
        Animated.timing(translateX, {
            toValue: slidePage * 50,
            duration: 260,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
        }).start();
    }, [slidePage, translateX]);

    return (
        <View style={styles.topSliderMain}>
            <View style={styles.topSliderTrack}></View>
            <View style={styles.topSliderTrack}></View>
            <View style={styles.topSliderTrack}></View>
            <Animated.View
                style={[
                    styles.topSliderItemActive,
                    {transform: [{translateX}]},
                ]}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    topSliderMain: {
        width: 150,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignSelf: 'center',
        backgroundColor: colors.surface,
        borderRadius: radius.md + 2,
        marginBottom: spacing.xl,
        overflow: 'hidden',
    },
    topSliderTrack: {
        width: 50,
        height: 5,
        backgroundColor: colors.surface,
        borderRadius: 2.5,
    },
    topSliderItemActive: {
        position: 'absolute',
        left: 0,
        top: 0,
        width: 50,
        height: 5,
        borderRadius: 2.5,
        backgroundColor: colors.accent,
    }
});