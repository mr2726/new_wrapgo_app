import {View, Text, StyleSheet} from 'react-native';

export default function Loading() {
    return (
        <View style={styles.screen}>
            <Text style={styles.text}>Loading...</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        fontSize: 16,
        color: '#fff',
        fontFamily: 'LufgaRegular',
    },
});