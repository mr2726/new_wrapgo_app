import {View, Text, StyleSheet, ScrollView, Alert} from "react-native";
import React from 'react';

// COMPONENTS
import { SettingsButton } from "../../../components/ui/settingsButton";
import { TopControl } from "../../../components/ui/topControl";
// ----------------------------------------------------------------
// SERVICES
import {deleteAccount, logout} from "../../../components/service/service";
// ----------------------------------------------------------------

export default function Settings ({setPage, setSettingsPage, onLogout, onAccountDeleted}) {
    const handleDeleteAccount = React.useCallback(() => {
        Alert.alert(
            'Delete account',
            'This will permanently delete your account, profile data, and uploaded files. Continue?',
            [
                {text: 'Cancel', style: 'cancel'},
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const result = await deleteAccount();

                            if (result?.warnings?.length) {
                                Alert.alert('Account deleted', result.warnings.join('\n'));
                            }

                            onAccountDeleted?.();
                        } catch (error) {
                            Alert.alert('Delete account failed', error?.message || 'Could not delete account.');
                        }
                    },
                },
            ]
        );
    }, [onAccountDeleted]);

    const handleLogout = React.useCallback(async () => {
        const {error} = await logout();

        if (error) {
            Alert.alert('Logout warning', error.message || 'Session cleanup completed with warning.');
        }

        onLogout?.();
    }, [onLogout]);

    const settingsContent = [
        {
            title: "Personal information",
            icon : "user",
            onPress: () => setSettingsPage("personalInfo"),
        },
        {
            title: "Vehicle information",
            icon : "car",
            onPress: () => setSettingsPage("vehicleInfo"),
        },
        // {
        //     title: "Preferred Companies",
        //     icon : "info",
        //     onPress: () => alert("Preferred"),
        // },
        // {
        //     title: "Add Carrier",
        //     icon : "user-plus",
        //     onPress: () => alert("Add Carrier"),
        // },
        {
            title: "Terms of Service",
            icon : "file-text",
            onPress: () => alert("Terms of Service"),
        },
        {
            title: "Privacy Policy",
            icon : "shield",
            onPress: () => alert("Privacy Policy"),
        },
        {
            title: "Delete Account",
            icon : "user-x",
            onPress: handleDeleteAccount,
        },
        {
            title: "Logout",
            icon : "log-out",
            onPress: handleLogout,
        },
    ]

    return (
        <ScrollView>
            <View style={{marginBottom: 50}}>
                <TopControl title="Settings" setLocalPage={setPage} switchTo="profile"/>
            </View>
            {
                settingsContent.map ((item, index) => (
                    <SettingsButton key={index} title={item.title} onPress={item.onPress} icon={item.icon} style={{marginTop: 10}} />
                ))
            }
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    text: {
        color: "white"
    }
})