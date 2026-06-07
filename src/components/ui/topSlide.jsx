import {View, StyleSheet} from 'react-native';
import React from 'react';

export function TopSlide({slidePage}) {
    return (
        <View style={styles.topSliderMain}>
            <View style={[styles.topSliderItem, slidePage === 0 && styles.topSliderItemActive]}></View>
            <View style={[styles.topSliderItem, slidePage === 1 && styles.topSliderItemActive]}></View>
            <View style={[styles.topSliderItem, slidePage === 2 && styles.topSliderItemActive]}></View>
        </View>
    );
}

const styles = StyleSheet.create({
    topSliderMain: {
        width: 150,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignSelf: 'center',
        backgroundColor: '#151515',
        borderRadius: 10,
        marginBottom: 20,
    },
    topSliderItem: {
        width: 50,
        height: 5,
        backgroundColor: '#151515',
        borderRadius: 2.5,
    },
    topSliderItemActive: {
        backgroundColor: '#39ff14',
    }
});