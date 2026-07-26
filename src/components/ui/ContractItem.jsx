import React from "react";
import {View, Text, Image, StyleSheet, Pressable} from "react-native";
import {colors, typography} from "../../styles/theme";
import {Camera} from "../Icons";

// COMPONENTS
import {Button_} from "../ui/buttons";
// --------------------------------------------------------------

export const ContractItem = ({data}) => {
    const [leftSidePhoto, setLeftSidePhoto] = React.useState(null);
    const [rightSidePhoto, setRightSidePhoto] = React.useState(null);
    return (
        <View style={styles.container}>
            <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10}}>
                <View style={{borderBottomWidth: 1, borderBottomColor: colors.border, display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 10}}>
                    <Image source={{uri: data.document}} style={styles.image} />
                    <View>
                        <Text style={styles.title}>{data.name}</Text>
                        <Text style={styles.description}>{data.city}</Text>
                    </View>
                </View>
                <View style={styles.status}>
                    <Text style={styles.statusText}>Status</Text>
                </View>
            </View>
            <View>
                <Text style={styles.title}>Go to wrapping</Text>
                {/* <Text style={styles.description}>Tue Apr 22 at 10:00 AM</Text> */}
            </View>
            <View style={[styles.photoButtons, {display: 'flex', flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, marginBottom: 10}]}>
                <Pressable style={styles.sidePick} onPress={() => console.log("Open Camera")}>
                     <Camera width={30} height={30} />
                    <Text style={styles.sideText}>Left Side</Text>
                </Pressable>
                <Pressable style={styles.sidePick} onPress={() => console.log("Open Camera")}>
                    <Camera width={30} height={30} />
                    <Text style={styles.sideText}>Right Side</Text>
                </Pressable>
            </View>
            
            <Button_ title={(leftSidePhoto && rightSidePhoto) ? "Go Active" : "Go to Wrap"} onPress={() => console.log("Go to Wrap pressed")} style={{marginTop: 10}} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        backgroundColor: colors.surface,
        borderRadius: 8,
        marginBottom: 10,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.textPrimary,
    },
    image: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    description: {
        fontSize: 14,
        color: colors.textSecondary,
    },
    status: {
        marginTop: 10,
        borderStyle: 'solid',
        borderWidth: 1,
        borderColor: "#FFC107",
        padding: 5,
        paddingHorizontal: 10,
        borderRadius: 100,
        alignItems: 'center',
    },
    statusText: {
        fontSize: 12,
        color: colors.textPrimary,
        fontFamily: typography.familyRegular,
    },
    sidePick: {
        flex: 1,
        width: 100,
        height: 100,
        padding: 10,
        borderWidth: 1,
        borderColor: colors.borderLight,
        borderRadius: 8,
        alignItems: 'center',
        marginRight: 10,
        display: 'flex',
        justifyContent: 'center',
        alignContent: 'center',
    },
    sideText: {
        color: colors.textPrimary,
        fontFamily: typography.familyRegular,
    }
});