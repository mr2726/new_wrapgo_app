import {View, Text, StyleSheet} from "react-native";
// Screens
import Settings from "./Settings";

export default function SettingsContent ({setPage}) {
    return (
        <View>
            <Settings setPage={setPage} />
        </View>
    )
}

const styles = StyleSheet.create({
    text: {
        color: "white"
    }
})