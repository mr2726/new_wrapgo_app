import {View, Text, StyleSheet} from "react-native";
import React from "react";
// COMPONENTS
import { Input_ } from "../../../components/ui/inputs";
import { TopControl } from "../../../components/ui/topControl";
// ----------------------------------------------------------------

export default function PersonalInfo(){
    const [edditable, setEditable] = React.useState(false);
    return (
        <View>
            <View>
                <TopControl title="Personal Information" setLocalPage={() => {}} switchTo="settings"/>
            </View>
            <View>
                <Input_ label="Full Name" disable={true} />
                <Input_ label="Email" placeholder="Enter your email" />
                <Input_ label="Phone" placeholder="Enter your phone number" />
            </View>
            <Text style={styles.text}>Personal Information</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    text: {
        color: "white"
    }
})