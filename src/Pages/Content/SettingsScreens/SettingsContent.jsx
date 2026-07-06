import {View, Text, StyleSheet} from "react-native";
import React from "react";
// Screens
import Settings from "./Settings";
import PersonalInfo from "./PersonalInfo";

export default function SettingsContent ({setPage}) {
    const [settingsPage, setSettingsPage] = React.useState("settings");
    return (
        <View>
            {settingsPage === "settings" && <Settings setPage={setPage} setSettingsPage={setSettingsPage} />}
            {settingsPage === "personalInfo" && <PersonalInfo />}

        </View>
    )
}

const styles = StyleSheet.create({
    text: {
        color: "white"
    }
})