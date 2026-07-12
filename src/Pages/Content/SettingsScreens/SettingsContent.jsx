import {View, Text, StyleSheet, ScrollView} from "react-native";
import React from "react";
// Screens
import Settings from "./Settings";
import PersonalInfo from "./PersonalInfo";

export default function SettingsContent ({setPage}) {
    const [settingsPage, setSettingsPage] = React.useState("settings");
    return (
        <ScrollView>
            {settingsPage === "settings" && <Settings setPage={setPage} setSettingsPage={setSettingsPage} />}
            {settingsPage === "personalInfo" && <PersonalInfo />}

        </ScrollView>
    )
}

const styles = StyleSheet.create({
    text: {
        color: "white"
    }
})