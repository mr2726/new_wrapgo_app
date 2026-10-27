import {TextInput, StyleSheet, View} from 'react-native';
import React from 'react';
import {colors, radius, spacing, typography} from '../../styles/theme';

export function OTPinput({value, onChangeText, error}) {
    const inputKeys = ['input1', 'input2', 'input3', 'input4', 'input5', 'input6'];
    const inputRefs = React.useRef([]);

    const handleInputChange = (text, key, index) => {
        const normalizedValue = text.slice(-1);
        onChangeText({...value, [key]: normalizedValue});

        if (normalizedValue && index < inputKeys.length - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    return (
        <View style={styles.container}>
            {inputKeys.map((key, index) => {
                const prevKey = inputKeys[index - 1];
                const isFilled = Boolean(value[key]);
                const showError = Boolean(error) && !isFilled;
                const showSuccess = isFilled;

                return (
                    <TextInput
                        key={key}
                        ref={(ref) => {
                            inputRefs.current[index] = ref;
                        }}
                        autoFocus={index === 0}
                        onKeyPress={({nativeEvent}) => {
                            if (nativeEvent.key === 'Backspace' && !value[key] && index > 0) {
                                onChangeText({...value, [prevKey]: ''});
                                inputRefs.current[index - 1]?.focus();
                            }
                        }}
                        value={value[key]}
                        onChangeText={(text) => handleInputChange(text, key, index)}
                        keyboardType="text"
                        maxLength={1}
                        style={[
                            styles.input,
                            showSuccess && styles.inputSuccess,
                            showError && styles.inputError,
                        ]}
                    />
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        alignItems: 'center',
        marginVertical: spacing.xl,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    input: {
        flex: 1,
        maxWidth: 52,
        minWidth: 0,
        height: 51,
        marginHorizontal: 2,
        fontSize: typography.sizeXl,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface,
        color: colors.textPrimary,
        borderRadius: radius.sm,
        textAlign: 'center',
        fontFamily: typography.familyMedium,
    },
    inputError: {
        borderColor: colors.error,
    },
    inputSuccess: {
        borderColor: colors.accent,
    },
});