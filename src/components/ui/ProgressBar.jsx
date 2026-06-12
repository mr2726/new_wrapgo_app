import {View, StyleSheet, Animated, Easing} from 'react-native';
import React from 'react';
import {colors, spacing} from '../../styles/theme';

export const ProgressBar = ({step, activeStep}) => {
    const safeStep = Math.max(0, Number(step) || 0);
    const safeActiveStep = Math.min(
        Math.max(0, Number(activeStep) || 0),
        Math.max(0, safeStep - 1),
    );
    const [containerWidth, setContainerWidth] = React.useState(0);
    const translateX = React.useRef(new Animated.Value(0)).current;
    const segmentWidth = safeStep > 0 ? containerWidth / safeStep : 0;

    React.useEffect(() => {
        if (segmentWidth <= 0) {
            return;
        }

        Animated.timing(translateX, {
            toValue: safeActiveStep * segmentWidth,
            duration: 260,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
        }).start();
    }, [safeActiveStep, segmentWidth, translateX]);

    return (
        <View
            style={styles.container}
            onLayout={(event) => setContainerWidth(event.nativeEvent.layout.width)}
        >
            {Array.from({length: safeStep}).map((_, index) => (
                <View key={index} style={styles.progress} />
            ))}
            {safeStep > 0 && segmentWidth > 0 && (
                <Animated.View
                    style={[
                        styles.activeProgress,
                        {
                            width: segmentWidth,
                            transform: [{translateX}],
                        },
                    ]}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: 5,
        flexDirection: 'row',
        borderRadius: 5,
        marginBottom: spacing.lg,
        overflow: 'hidden',
    },
    progress: {
        height: '100%',
        flex: 1,
        backgroundColor: colors.surface,
        borderRadius: 5,
    },
    activeProgress: {
        position: 'absolute',
        left: 0,
        top: 0,
        height: '100%',
        borderRadius: 5,
        backgroundColor: colors.accent,
    },
});