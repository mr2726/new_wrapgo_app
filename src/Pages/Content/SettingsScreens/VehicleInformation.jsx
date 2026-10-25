import {View, Text, ScrollView, StyleSheet} from "react-native";
import React from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
// COMPONENTS
import { TopControl } from "../../../components/ui/topControl";
import { NonEditableInfo } from "../../../components/ui/NonEdditableInfo";
// ----------------------------------------------------------------
// SERVICES 
import {getVehicleDataByOTP} from "../../../components/service/service";
// ----------------------------------------------------------------

export default function VehicleInformation ({setPage, setSettingsPage}) {
    const [vehicleData, setVehicleData] = React.useState(null);
    React.useEffect(() => {
        const fetchVehicleData = async () => {
            try {
                const userDataString = await AsyncStorage.getItem("userData");
                if (!userDataString) {
                    setVehicleData(null);
                    return;
                }

                const userData = JSON.parse(userDataString);
                const inviteCode = String(userData?.carid || "").trim();

                if (!inviteCode) {
                    setVehicleData(null);
                    return;
                }

                const data = await getVehicleDataByOTP(inviteCode);
                setVehicleData(data);
            } catch (error) {
                console.error("Error fetching vehicle data:", error);
                setVehicleData(null);
            }
        };

        fetchVehicleData();
    }, []);

    return (
        <ScrollView style={{marginBottom: 150}}>
            <View style={{marginBottom: 50}}>
                <TopControl title="Vehicle Information" setLocalPage={() => {setSettingsPage("settings")}} switchTo="settings"/>
            </View>
            <View>
                {vehicleData && (
                    <>
                        <NonEditableInfo label="Vehicle Make" value={vehicleData.mark} />
                        <NonEditableInfo label="Vehicle Model" value={vehicleData.model} />
                        <NonEditableInfo label="Year" value={vehicleData.year} />
                        <NonEditableInfo label="License Plate" value={vehicleData.plate} />
                    </>
                )}
            </View>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    text: {
        color: "white"
    }
})