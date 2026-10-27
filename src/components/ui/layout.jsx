import React from 'react';
import {Keyboard, Platform} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {spacing} from '../../styles/theme';

// The app runs edge-to-edge, so the window is not resized by the keyboard.
// This scroll view scrolls the focused input above the keyboard and keeps
// every field and action reachable on short screens.
export function FormScroll({children, contentContainerStyle, ...rest}) {
    return (
        <KeyboardAwareScrollView
            enableOnAndroid
            extraScrollHeight={spacing.xl}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[{flexGrow: 1, paddingBottom: spacing.lg}, contentContainerStyle]}
            {...rest}
        >
            {children}
        </KeyboardAwareScrollView>
    );
}

export function useKeyboardVisible() {
    const [visible, setVisible] = React.useState(false);

    React.useEffect(() => {
        const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
        const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
        const showSub = Keyboard.addListener(showEvent, () => setVisible(true));
        const hideSub = Keyboard.addListener(hideEvent, () => setVisible(false));

        return () => {
            showSub.remove();
            hideSub.remove();
        };
    }, []);

    return visible;
}
