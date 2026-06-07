import {Text, View, Image, Pressable, StyleSheet} from 'react-native';
import React from 'react';
import {LinearGradient} from 'expo-linear-gradient';

export function TopControl({setLocalPage}) {
    return (
        <View style={styles.screen}>
            <Pressable style={styles.pressable} onPress={() => setLocalPage("signin")}>
                <LinearGradient
                    colors={['#0F0F0F', '#202020']}
                    start={{x: 0.5, y: 0}}
                    end={{x: 0.5, y: 1}}
                    style={styles.gradient}
                >
                    <Image source={require('./imgs/ArrowLeft.png')}/>
                </LinearGradient>
            </Pressable>
            <Text style={styles.text}>Create Account</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flexDirection: 'row',
        alignItems: 'center',
        position: 'absolute',
        top: 10,
        left: 10,
    },
    text: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 20,
    },
    pressable: {
        borderRadius: 100,
        overflow: 'hidden',
    },
    gradient: {
        width: 40,
        height: 40,
        borderRadius: 100,
        justifyContent: 'center',
        alignItems: 'center',
    },
});