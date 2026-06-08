import {View, Text, StyleSheet} from 'react-native';
import React from 'react';
import {Feather} from '@expo/vector-icons';
export default function Success({title, description}) {
    return (
        <View style={styles.screen}>
            <View style={{width: 80, height: 80, borderRadius: 40, backgroundColor: '#39ff14', justifyContent: 'center', alignItems: 'center', marginBottom: 20}}>
                <Feather name="check" size={45} color="black" />
            </View>
            <Text style={{color: '#fff', fontSize: 24, fontWeight: 'bold'}}>{title}</Text>
            <Text style={{color: '#727272', fontSize: 14, marginTop: 10, width: 200, textAlign: 'center'}}>{description}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#040404',
    },
});
