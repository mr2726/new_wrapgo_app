import {View, Linking, StyleSheet, ScrollView, Alert, Modal, ActivityIndicator, Text} from "react-native";
import React from 'react';

// COMPONENTS
import { SettingsButton } from "../../../components/ui/settingsButton";
import { TopControl } from "../../../components/ui/topControl";
// ----------------------------------------------------------------
// SERVICES
import {logout} from "../../../components/service/service";
// ----------------------------------------------------------------

export default function Settings ({setPage, setSettingsPage, onLogout, onAccountDeleted}) {
    const [isDeleting, setIsDeleting] = React.useState(false);
    const isDeletingRef = React.useRef(false);

    const runDeletion = React.useCallback(async () => {
        if (isDeletingRef.current) return;
        isDeletingRef.current = true;
        setIsDeleting(true);

        try {
            Linking.openURL("https://wrapgo-delete-account.vercel.app/")
        } catch (error) {
            setIsDeleting(false);
            Alert.alert('Delete account failed', error?.message || 'Could not delete account.');
        } finally {
            isDeletingRef.current = false;
        }
    }, [onAccountDeleted]);

    const handleDeleteAccount = React.useCallback(() => {
        if (isDeletingRef.current) return;

        Alert.alert(
            'Delete account permanently?',
            'This cannot be undone. Your account, profile, personal information, selfie, vehicle photos and documents, signed contracts and location history will be permanently deleted. The vehicle assigned to you will be released back to your fleet. You will not be able to sign in again.',
            [
                {text: 'Cancel', style: 'cancel'},
                {text: 'Delete permanently', style: 'destructive', onPress: () => Linking.openURL("https://wrapgo-delete-account.vercel.app/")},
            ]
        );
    }, [runDeletion]);

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
        {
            title: "Fleet Code",
            icon : "hash",
            onPress: () => setSettingsPage("fleetCode"),
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
            onPress: () => Linking.openURL("https://new-wrap-go-jyeh.vercel.app/app?view=terms"),
        },
        {
            title: "Privacy Policy",
            icon : "shield",
            onPress: () => Linking.openURL("https://new-wrap-go-jyeh.vercel.app/app?view=privacy"),
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
        <ScrollView contentContainerStyle={{paddingBottom: 16}} showsVerticalScrollIndicator={false}>
            <Modal visible={isDeleting} transparent animationType="fade" statusBarTranslucent onRequestClose={() => {}}>
                <View style={styles.overlay}>
                    <ActivityIndicator size="large" color="white" />
                    <Text style={styles.text}>Deleting your account…</Text>
                </View>
            </Modal>
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
        color: "white",
        marginTop: 16
    },
    overlay: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0,0,0,0.7)"
    }
})