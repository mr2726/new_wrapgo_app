import {View, Text, StyleSheet, ScrollView} from 'react-native';
import {colors, typography} from '../../styles/theme';

import {TopControl} from '../../components/ui/topControl';

import {InfoIcon} from '../../components/Icons';

export default function Payment({setLocalPage}) {
    return (
        <View style={styles.container}>
            <View style={{marginBottom: 70}}>
                <TopControl setLocalPage={setLocalPage} title="Payments" switchTo="home"/>
            </View>
            <View style={styles.mainContent}>
                <View style={styles.mainBoll}>
                    <View style={styles.secondBall}>
                        <InfoIcon />
                    </View>
                </View>
                <Text style={styles.title}>Contact your fleet owner</Text>
                <Text style={styles.text}>Your payments are managed by your fleet owner. Contact your fleet owner to receive your earnings.</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    mainContent: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 16,
        color: colors.textPrimary,
        fontFamily: typography.familyMedium,
        textAlign: 'center',
    },
    text: {
        fontSize: 12,
        color: colors.textSecondary,
        fontFamily: typography.familyRegular,
        textAlign: 'center',
    },
    mainBoll:{
        width: 104,
        height: 104,
        borderRadius: 52,
        backgroundColor: '#1A1A1A60',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    secondBall:{
        width: 66.56,
        height: 66.56,
        borderRadius: 33.28,
        backgroundColor: '#242424',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    }
});