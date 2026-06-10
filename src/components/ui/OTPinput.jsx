import {TextInput, StyleSheet, View} from 'react-native';
import React from 'react';
import {colors, radius, spacing, typography} from '../../styles/theme';

export function OTPinput({value, onChangeText, error}) {
    const inputKeys = ['input1', 'input2', 'input3', 'input4', 'input5', 'input6'];

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
                            if (!ref) {
                                return;
                            }

                            if (index === 0 || value[prevKey]) {
                                ref.focus();
                            }
                        }}
                        onFocus={() => {
                            if (index > 0 && !value[prevKey]) {
                                const keyToFocus = prevKey || key;
                                onChangeText({...value, [keyToFocus]: ''});
                            }
                        }}
                        onKeyPress={({nativeEvent}) => {
                            if (nativeEvent.key === 'Backspace' && !value[key]) {
                                const keyToClear = prevKey || key;
                                onChangeText({...value, [keyToClear]: ''});
                            }
                        }}
                        value={value[key]}
                        onChangeText={(text) => onChangeText({...value, [key]: text})}
                        keyboardType="numeric"
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
        width: 52,
        height: 51,
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