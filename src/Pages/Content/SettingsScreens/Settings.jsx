import {View, Text, StyleSheet} from "react-native";

// COMPONENTS
import { SettingsButton } from "../../../components/ui/settingsButton";
import { TopControl } from "../../../components/ui/topControl";
// ----------------------------------------------------------------

export default function Settings ({setPage, setSettingsPage}) {
    const settingsContent = [
        {
            title: "Personal information",
            icon : "user",
            onPress: () => setSettingsPage("personalInfo"),
        },
        {
            title: "Vehicle information",
            icon : "car",
            onPress: () => alert("Vehicle"),
        },
        {
            title: "Preferred Companies",
            icon : "info",
            onPress: () => alert("Preferred"),
        },
        {
            title: "Add Carrier",
            icon : "user-plus",
            onPress: () => alert("Add Carrier"),
        },
        {
            title: "Terms of Service",
            icon : "Terms",
            onPress: () => alert("Terms of Service"),
        },
        {
            title: "Privacy Policy",
            icon : "Privacy",
            onPress: () => alert("Privacy Policy"),
        },
        {
            title: "Delete Account",
            icon : "user-x",
            onPress: () => alert("Delete Account"),
        },
        {
            title: "Logout",
            icon : "log-out",
            onPress: () => alert("Logout"),
        },
    ]

    return (
        <View>
            <View style={{marginBottom: 50}}>
                <TopControl title="Settings" setLocalPage={setPage} switchTo="profile"/>
            </View>
            {
                settingsContent.map ((item, index) => (
                    <SettingsButton key={index} title={item.title} onPress={item.onPress} icon={item.icon} style={{marginTop: 10}} />
                ))
            }
        </View>
    )
}

const styles = StyleSheet.create({
    text: {
        color: "white"
    }
})