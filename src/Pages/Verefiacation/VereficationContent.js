import {View, Text, StyleSheet} from 'react-native';
import React from 'react';
import {colors, spacing, typography} from '../../styles/theme';
import {Feather} from '@expo/vector-icons';

// COMPONENTS
import {ProgressBar} from '../../components/ui/ProgressBar';
import {TopControl} from '../../components/ui/topControl';
import {Button_} from '../../components/ui/buttons';
// ------------------------------------------------------------------------

// CONTENT
import DriverInfo from './DriverInfo';
// ------------------------------------------------------------------------
export default function VereficationContent({setPage}) {
    const [currentScreen, setCurrentScreen] = React.useState(0); // 0 - 6
    return (
        <View style={styles.screen}>
            <View style={{position: "relative", height: 50, marginBottom: 20}}>
                <TopControl title="Driver Verification" setLocalPage={() => setCurrentScreen(currentScreen-1)}/>
            </View>
            <ProgressBar step={7} activeStep={currentScreen} />
            <Text style={styles.screenText}>Driver Information</Text>

            {currentScreen === 0 && (<DriverInfo />)}

            <View style={{position: "absolute", bottom: spacing.xxl, left: 0, right: 0, paddingHorizontal: spacing.lg}}>
                <Button_
                    title="Continue"
                    onPress={() => setPage('verification')}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        width: '100%',
        height: '100%',
        marginTop: spacing.xl,
        paddingHorizontal: spacing.lg,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
    screenText: {
        fontSize: typography.sizeLg,
        color: colors.textPrimary,
        marginBottom: spacing.lg,
        fontFamily: typography.familyRegular,
        textAlign: 'center',
    }
});