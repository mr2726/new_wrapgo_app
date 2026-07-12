import {Text, View, TextInput, StyleSheet} from "react-native";
import {colors, typography} from "../../styles/theme";

export const NonEditableInfo = ({value, label}) => {
    return (
        <View style={styles.container}>
            <Text style={styles.label}>{label}</Text>
            <Text style={styles.value}>{value}</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 15,
    },
    label: {
        color: colors.white,
        marginBottom: 5,
        fontFamily: typography.familyRegular,
    },
    value: {
        color: colors.textSecondary,
        fontSize: 16,
        fontFamily: typography.familyRegular,
        backgroundColor: colors.border,
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 25,
    }
})