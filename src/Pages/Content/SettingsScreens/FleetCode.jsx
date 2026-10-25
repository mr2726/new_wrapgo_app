import {View, Text, StyleSheet} from "react-native";
import React from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { colors, spacing, typography } from "../../../styles/theme";

// COMPONENTS
import { Input_ } from "../../../components/ui/inputs";
import {TopControl} from "../../../components/ui/topControl";
import { Button_ } from "../../../components/ui/buttons";
import { getVehicleDataByOTP, updateDriverFleetCode } from "../../../components/service/service";
// ----------------------------------------------------------

export default function FleetCode({code = "", userEmail = "", setSettingsPage}) {
    const [fleetCode, setFleetCode] = React.useState(String(code || ""));
    const [initialFleetCode, setInitialFleetCode] = React.useState(String(code || ""));
    const [email, setEmail] = React.useState(String(userEmail || ""));
    const [isSaving, setIsSaving] = React.useState(false);
    const [errorText, setErrorText] = React.useState("");
    const [successText, setSuccessText] = React.useState("");

    React.useEffect(() => {
        const loadUserData = async () => {
            try {
                const userDataString = await AsyncStorage.getItem("userData");
                if (!userDataString) {
                    return;
                }

                const parsed = JSON.parse(userDataString);
                const storedCode = String(parsed?.carid || code || "");
                const storedEmail = String(parsed?.email || userEmail || "");

                setFleetCode(storedCode);
                setInitialFleetCode(storedCode);
                setEmail(storedEmail);
            } catch (error) {
                console.error("Failed to load userData from AsyncStorage:", error);
            }
        };

        loadUserData();
    }, [code, userEmail]);

    const normalizedFleetCode = fleetCode.trim();
    const hasChanges = normalizedFleetCode !== String(initialFleetCode || "").trim();

    const handleSave = async () => {
        const nextCode = normalizedFleetCode;
        setErrorText("");
        setSuccessText("");

        if (!nextCode) {
            setErrorText("Please enter fleet code");
            return;
        }

        if (!email) {
            setErrorText("User email not found");
            return;
        }

        setIsSaving(true);
        try {
            await getVehicleDataByOTP(nextCode);
            await updateDriverFleetCode(email, nextCode);

            const refreshedUserData = await AsyncStorage.getItem("userData");
            if (refreshedUserData) {
                const parsed = JSON.parse(refreshedUserData);
                const savedCode = String(parsed?.carid || nextCode);
                setFleetCode(savedCode);
                setInitialFleetCode(savedCode);
            } else {
                setInitialFleetCode(nextCode);
            }

            setSuccessText("Fleet code updated");
        } catch (error) {
            console.error("Failed to update fleet code:", error);
            setErrorText(
                error?.code === "PGRST116"
                    ? "Fleet code does not exist"
                    : (error?.message || "Could not update fleet code. Please try again.")
            );
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <View style={styles.infoBlock}>
            <View style={{marginBottom: 50}}>
                <TopControl title="Fleet Code" setLocalPage={() => {setSettingsPage("settings")}} switchTo="settings"/>
            </View>
            <Text style={styles.title}>Fleet Code</Text>
            <Input_
                value={fleetCode}
                disable={false}
                onChangeText={(value) => {
                    setFleetCode(value);
                    setErrorText("");
                    setSuccessText("");
                }}
            />
            <Text style={styles.description}>This code is linked to your account ({email}) and is used to identify your fleet.</Text>

            {!!errorText && <Text style={styles.errorText}>{errorText}</Text>}
            {!!successText && <Text style={styles.successText}>{successText}</Text>}

            {hasChanges && (
                <Button_ title={isSaving ? "Saving..." : "Save Code"} onPress={handleSave} dispable={isSaving} />
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    infoBlock: {
        width: "100%",
        padding: spacing.md,
    },
    title: {
        textAlign: "center",
        color: colors.textPrimary,
        fontSize: typography.sizeXl,
        marginBottom: spacing.md,
        fontFamily: typography.familyMedium,
    },
    description: {
        textAlign: "center",
        color: colors.textSecondary,
        fontSize: typography.sizeSm,
        marginTop: spacing.md,
        marginBottom: spacing.xl,
        fontFamily: typography.familyRegular,
    },
    errorText: {
        color: colors.error,
        fontSize: typography.sizeSm,
        textAlign: "center",
        marginBottom: spacing.md,
        fontFamily: typography.familyRegular,
    },
    successText: {
        color: colors.accent,
        fontSize: typography.sizeSm,
        textAlign: "center",
        marginBottom: spacing.md,
        fontFamily: typography.familyRegular,
    },
});