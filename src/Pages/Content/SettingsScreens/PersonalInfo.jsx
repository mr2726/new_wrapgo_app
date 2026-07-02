import {View, Text, StyleSheet} from "react-native";

export default function PersonalInfo(){
    return (
        <View>
            <Text style={styles.text}>Personal Information</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    text: {
        color: "white"
    }
})