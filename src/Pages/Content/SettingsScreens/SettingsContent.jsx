import {View, StyleSheet} from "react-native";
import React from "react";
// Screens
import Settings from "./Settings";
import PersonalInfo from "./PersonalInfo";
import VehicleInformation from "./VehicleInformation";
import FleetCode from "./FleetCode";

export default function SettingsContent ({setPage, onLogout, onAccountDeleted}) {
    const [settingsPage, setSettingsPage] = React.useState("settings");
    return (
        <View style={styles.screen}>
            {settingsPage === "settings" && (
                <Settings
                    setPage={setPage}
                    setSettingsPage={setSettingsPage}
                    onLogout={onLogout}
                    onAccountDeleted={onAccountDeleted}
                />
            )}
            {settingsPage === "personalInfo" && <PersonalInfo setPage={setPage} setSettingsPage={setSettingsPage} />}
            {settingsPage === "vehicleInfo" && <VehicleInformation setPage={setPage} setSettingsPage={setSettingsPage} />}
            {settingsPage === "fleetCode" && <FleetCode setSettingsPage={setSettingsPage} />}
        </View>
    )
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
    },
})