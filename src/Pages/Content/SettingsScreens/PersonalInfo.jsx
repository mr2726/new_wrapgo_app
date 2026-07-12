import {View} from "react-native";
import React from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
// COMPONENTS
import { Input_ } from "../../../components/ui/inputs";
import { DateInput } from "../../../components/ui/DateInput";
import { TopControl } from "../../../components/ui/topControl";
import { Button_ } from "../../../components/ui/buttons";
// ----------------------------------------------------------------
// SERVICES
import {updatePersonalInfo} from "../../../components/service/service";
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

export default function PersonalInfo(){
    const defaultUserData = {
        fullName: "",
        email: "",
        phone: "",
        memberSince: "",
        dateOfBirth: "",
    };

    const [userData, setUserData] = React.useState(defaultUserData);
    const [initialUserData, setInitialUserData] = React.useState(defaultUserData);

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
        try {
            const payload = {
                ...userData,
                PhoneNumber: userData.phone,
                birthDate: userData.dateOfBirth,
            };

            await updatePersonalInfo(userData.email, payload);
            setInitialUserData(userData);
            await AsyncStorage.setItem('userData', JSON.stringify(userData));
        } catch (error) {
            console.error('Error updating personal info:', error);
        }
    };

    React.useEffect(() => {
        const fetchUserData = async () => {
            try {
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
                <TopControl title="Personal Information" setLocalPage={() => {}} switchTo="settings"/>
            </View>
            <View>
                <Input_ label="Full Name" disable={false} value={userData.fullName} onChangeText={(value) => handleFieldChange('fullName', value)} />
                <Input_ label="Email" disable={false} value={userData.email} onChangeText={(value) => handleFieldChange('email', value)} />
                <Input_ label="Phone" disable={false} value={formatPhoneDisplay(userData.phone)} onChangeText={(value) => handleFieldChange('phone', value)} />
                <DateInput label="Member Since" disabled={true} value={userData.memberSince} />
                <DateInput label="Date of Birthday" value={userData.dateOfBirth} onChange={(value) => handleFieldChange('dateOfBirth', value)} />

                {hasChanges && <Button_ title="Save" onPress={handleSave} />}
            </View>
        </View>
    )
}