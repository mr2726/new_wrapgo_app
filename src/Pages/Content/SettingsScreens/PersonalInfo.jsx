import {View, Text} from "react-native";
import React from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
// COMPONENTS
import { Input_ } from "../../../components/ui/inputs";
import { DateInput } from "../../../components/ui/DateInput";
import { TopControl } from "../../../components/ui/topControl";
import { Button_ } from "../../../components/ui/buttons";
// ----------------------------------------------------------------
// SERVICES
import {updatePersonalInfo, syncDriverEmailWithAuth} from "../../../components/service/service";
// ----------------------------------------------------------------

const formatPhoneDisplay = (value) => {
    const digits = String(value || '').replace(/\D/g, '');

    let localDigits = digits.startsWith('374') ? digits.slice(3, 11) : digits;

    if (localDigits.length === 8) {
        localDigits = `0${localDigits}`;
    } else if (localDigits.length > 9) {
        localDigits = localDigits.slice(-9);
    }

    if (localDigits.length !== 9) {
        return value || '';
    }

    return `(${localDigits.slice(0, 3)}) ${localDigits.slice(3, 6)}-${localDigits.slice(6, 9)}`;
};

export default function PersonalInfo({setPage, setSettingsPage}) {
    const defaultUserData = {
        fullName: "",
        email: "",
        phone: "",
        memberSince: "",
        dateOfBirth: "",
    };

    const [userData, setUserData] = React.useState(defaultUserData);
    const [initialUserData, setInitialUserData] = React.useState(defaultUserData);

    const [status, setStatus] = React.useState({type: '', message: ''});
    const [saving, setSaving] = React.useState(false);

    const hasChanges = React.useMemo(() => {
        return JSON.stringify(userData) !== JSON.stringify(initialUserData);
    }, [userData, initialUserData]);

    const handleFieldChange = (key, value) => {
        setUserData(prev => ({
            ...prev,
            [key]: value,
        }));
    };

    const handleSave = async () => {
        if (saving) return;
        setSaving(true);
        try {
            const payload = {
                ...userData,
                PhoneNumber: userData.phone,
                birthDate: userData.dateOfBirth,
            };

            setStatus({type: '', message: ''});
            const result = await updatePersonalInfo(payload);

            // Show the email actually stored; a pending change keeps the current one.
            const cached = JSON.parse((await AsyncStorage.getItem('userData')) || '{}');
            const savedData = {
                ...userData,
                email: cached.email || userData.email,
            };
            if (result.emailChangePending) {
                savedData.email = cached.email || initialUserData.email;
                setStatus({
                    type: 'info',
                    message: `Check ${result.pendingEmail} (and your current email) to confirm the email change. Your email will update after confirmation.`,
                });
            } else {
                setStatus({type: 'success', message: 'Personal information updated.'});
            }
            setUserData(savedData);
            setInitialUserData(savedData);
        } catch (error) {
            console.error('Error updating personal info:', error);
            setStatus({type: 'error', message: error?.message || 'Failed to update personal information.'});
        } finally {
            setSaving(false);
        }
    };

    React.useEffect(() => {
        const fetchUserData = async () => {
            try {
                await syncDriverEmailWithAuth().catch(() => null);
                const userDataString = await AsyncStorage.getItem('userData');
                if (userDataString) {
                    const parsedData = JSON.parse(userDataString);
                    const normalizedUserData = {
                        fullName: parsedData.fullName || parsedData.name || "",
                        email: parsedData.email || "",
                        phone: parsedData.phone || parsedData.PhoneNumber || "",
                        memberSince: parsedData.memberSince || parsedData.created_at || "",
                        dateOfBirth: parsedData.dateOfBirth || parsedData.dateofbirsday || parsedData.birthDate || "",
                    };

                    setUserData(normalizedUserData);
                    setInitialUserData(normalizedUserData);
                }
            } catch (error) {
                console.error('Error fetching user data from AsyncStorage:', error);
            }
        };
        fetchUserData();
    }, []);
    return (
        <View>
            <View style={{marginBottom: 50}}>
                <TopControl title="Personal Information" setLocalPage={() => {setSettingsPage("settings")}} switchTo="settings"/>
            </View>
            <View>
                <Input_ label="Full Name" disable={false} value={userData.fullName} onChangeText={(value) => handleFieldChange('fullName', value)} />
                <Input_ label="Email" disable={false} autoCapitalize="none" type="email-address" value={userData.email} onChangeText={(value) => handleFieldChange('email', value)} />
                <Input_ label="Phone" disable={false} value={formatPhoneDisplay(userData.phone)} onChangeText={(value) => handleFieldChange('phone', value)} />
                <DateInput label="Member Since" disabled={true} value={userData.memberSince} />
                <DateInput label="Date of Birthday" value={userData.dateOfBirth} onChange={(value) => handleFieldChange('dateOfBirth', value)} />

                {!!status.message && (
                    <Text style={{color: status.type === 'error' ? '#D32F2F' : status.type === 'success' ? '#2E7D32' : '#555', marginBottom: 12}}>
                        {status.message}
                    </Text>
                )}
                {hasChanges && <Button_ title={saving ? "Saving..." : "Save"} onPress={handleSave} disabled={saving} />}
            </View>
        </View>
    )
}