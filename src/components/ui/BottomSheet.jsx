import React, { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
  PanResponder,
} from 'react-native';
import { colors } from '../../styles/theme';

const SCREEN_HEIGHT = Dimensions.get('window').height;

export default function BottomSheet({
  visible,
  onClose,
  children,
  height = '85%',
}) {
  const translateY = useRef(
    new Animated.Value(SCREEN_HEIGHT)
  ).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const closeSheet = () => {
    Animated.timing(translateY, {
      toValue: SCREEN_HEIGHT,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      onClose?.();
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,

      onMoveShouldSetPanResponder: (_, gestureState) => {
        return gestureState.dy > 5;
      },

      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },

      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 120) {
          closeSheet();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={closeSheet}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'flex-end',
        }}
      >
        <TouchableWithoutFeedback onPress={closeSheet}>
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
          />
        </TouchableWithoutFeedback>

        <Animated.View
          style={{
            height,
            backgroundColor: colors.background,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            transform: [{ translateY }],
            overflow: 'hidden',
            borderColor: colors.border,
            borderWidth: 1,
            position: 'relative',
          }}
        >
          {/* Handle */}
          <View
            {...panResponder.panHandlers}
            style={{
              alignItems: 'center',
              paddingTop: 12,
              paddingBottom: 16,
            }}
          >
            <View
              style={{
                width: 50,
                height: 3,
                borderRadius: 999,
                backgroundColor: colors.textPrimary,
              }}
            />
          </View>

          <View style={{ flex: 1 }}>
            {children}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}