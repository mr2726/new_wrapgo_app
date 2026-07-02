import {View, Text, StyleSheet} from 'react-native';
import React from 'react';
import {colors, spacing, typography} from '../../styles/theme';
import {Feather} from '@expo/vector-icons';

// COMPONENTS
import {Input_} from '../../components/ui/inputs';
// ------------------------------------------------------------------------

export default function VehicleInfo({collectedData, setCollectedData, validationErrors = {}}) {
    return (
        <View style={styles.screen}>
            <Input_
                label="Vehicle Make"
                value={collectedData.vehicleMake}
                onChangeText={(text) => {
                    setCollectedData({...collectedData, vehicleMake: text});
                }}
                style={{marginBottom: spacing.lg}}
                disable={false}
                error={validationErrors.vehicleMake}
                errorText={validationErrors.vehicleMake}
            />
            <Input_
                label="Vehicle Model"
                value={collectedData.vehicleModel}
                onChangeText={(text) => {
                    setCollectedData({...collectedData, vehicleModel: text});
                }}
                style={{marginBottom: spacing.lg}}
                disable={false}
                error={validationErrors.vehicleModel}
                errorText={validationErrors.vehicleModel}
            />
            <Input_
                label="Vehicle Year"
                value={collectedData.vehicleYear}
                onChangeText={(text) => {
                    setCollectedData({...collectedData, vehicleYear: text});
                }}
                style={{marginBottom: spacing.lg}}
                disable={false}
                error={validationErrors.vehicleYear}
                errorText={validationErrors.vehicleYear}
            />  
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        padding: spacing.lg,
        backgroundColor: colors.background,
    },
});