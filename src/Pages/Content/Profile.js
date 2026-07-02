import {View, Text, StyleSheet} from 'react-native';
import {colors, radius, spacing, typography} from '../../styles/theme';

// COMPONENT
import { TopControl } from '../../components/ui/topControl';
// ----------------------------------------------------------

export default function Profile ({setLocalPage}) {
    return (
        <View>
            <View style={styles.topControll}>
                <TopControl setLocalPage={() => setLocalPage("home")} title="My Profile" additionalBTN="settings" setLocalPage={setLocalPage} switchTo="home"/>
            </View>
            <Text style={styles.text}>Profile Page</Text>
        </View>
    )
} 


const styles = StyleSheet.create({
    text: {
        color: "white",
    },

    topControll: {
        marginBottom: 30,
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        position: "relative"
    }
})