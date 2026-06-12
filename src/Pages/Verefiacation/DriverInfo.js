import {View, Text, StyleSheet} from 'react-native';
import React from 'react';
import {colors, spacing, typography} from '../../styles/theme';
import {Feather} from '@expo/vector-icons';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

// COMPONENTS
import {Input_} from '../../components/ui/inputs';
import {DateInput} from '../../components/ui/DateInput';
// ------------------------------------------------------------------------

export default function DriverInfo() {
    const [driverInfo, setDriverInfo] = React.useState({
        fullName: 'Full Name of Driver',
        email: '',
        phoneNumber: '',
        birthDate: '',
    });

    return (
        <KeyboardAwareScrollView
            enableOnAndroid
            extraScrollHeight={30}
            keyboardShouldPersistTaps="handled"
        >
            <View style={styles.screen}>
                <Input_ 
                    label="Full Name" 
                    value={driverInfo.fullName}
                    onChangeText={(text) => setDriverInfo({...driverInfo, fullName: text})}
                    style={{marginBottom: spacing.lg}}
                    disable={false}
                />
                <Input_
                    label="Email Address"
                    value={driverInfo.email}
                    onChange={(text) => setDriverInfo({...driverInfo, email: text})}
                    icon={<Feather name="mail" size={20} color={colors.icons} />}
                    style={{marginBottom: spacing.lg}}
                />
                <Input_
                    label="Phone Number"
                    value={driverInfo.phoneNumber}
                    onChange={(text) => setDriverInfo({...driverInfo, phoneNumber: text})}
                    icon={<Feather name="phone" size={20} color={colors.icons} />}
                    style={{marginBottom: spacing.lg}}
                />

                <DateInput
                    label="Date of Birth"
                    value={driverInfo.birthDate}
                    onChange={(date) => setDriverInfo({...driverInfo, birthDate: date})}
                    style={{marginBottom: spacing.lg}}
                />
            </View>
        </KeyboardAwareScrollView>
    );
}

const styles = StyleSheet.create({
    screen: {
        width: '100%',
        height: '100%',
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