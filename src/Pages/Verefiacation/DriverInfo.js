import {View, Text, StyleSheet} from 'react-native';
import React from 'react';
import {colors, spacing, typography} from '../../styles/theme';
import {Feather} from '@expo/vector-icons';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

// COMPONENTS
import {Input_} from '../../components/ui/inputs';
import {DateInput} from '../../components/ui/DateInput';
// ------------------------------------------------------------------------

export default function DriverInfo({collectedData, setCollectedData, validationErrors = {}}) {
    return (
        <KeyboardAwareScrollView
            enableOnAndroid
            extraScrollHeight={30}
            keyboardShouldPersistTaps="handled"
        >
            <View style={styles.screen}>
                <Input_
                    label="Full Name"
                    value={collectedData.fullName}
                    onChangeText={(text) => {
                        setCollectedData({...collectedData, fullName: text});
                    }}
                    style={{marginBottom: spacing.lg}}
                    disable={false}
                    error={validationErrors.fullName}
                    errorText={validationErrors.fullName}
                />
                <Input_
                    label="Email Address"
                    value={collectedData.email}
                    onChangeText={(text) => {
                        setCollectedData({...collectedData, email: text});
                    }}
                    icon={<Feather name="mail" size={20} color={colors.icons} />}
                    style={{marginBottom: spacing.lg}}
                    disable={false}
                    error={validationErrors.email}
                    errorText={validationErrors.email}
                    type="email-address"
                />
                <Input_
                    label="Phone Number"
                    value={collectedData.phoneNumber}
                    onChangeText={(text) => {
                        setCollectedData({...collectedData, phoneNumber: text});
                    }}
                    icon={<Feather name="phone" size={20} color={colors.icons} />}
                    style={{marginBottom: spacing.lg}}
                    error={validationErrors.phoneNumber}
                    errorText={validationErrors.phoneNumber}
                    type="phone-pad"
                />

                <DateInput
                    label="Date of Birth"
                    value={collectedData.birthDate}
                    onChange={(date) => {
                        setCollectedData({...collectedData, birthDate: date});
                    }}
                    style={{marginBottom: spacing.lg}}
                    error={validationErrors.birthDate}
                />
            </View>
        </KeyboardAwareScrollView>
    );
}

const styles = StyleSheet.create({
    screen: {
        flexGrow: 1,
    },
    title: {
        fontSize: typography.xl,
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginTop: spacing.lg,
    },
    message: {
        fontSize: typography.sizeMd,
        color: colors.textSecondary,
        textAlign: 'center',
        marginTop: spacing.md,
    },
});
