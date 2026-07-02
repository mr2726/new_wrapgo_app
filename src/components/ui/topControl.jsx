import {Text, View, Image, Pressable, StyleSheet} from 'react-native';
import React from 'react';
import {LinearGradient} from 'expo-linear-gradient';
import {colors, spacing, typography} from '../../styles/theme';
import { Feather } from "@expo/vector-icons";

export function TopControl({setLocalPage, title, additionalBTN, switchTo}) {
    return (
        <View style={styles.screen}>
            <View style={styles.container}>
              <Pressable style={styles.pressable} onPress={() => setLocalPage(switchTo)}>
                <LinearGradient
                    colors={[colors.background, colors.surfaceMuted]}
                    start={{x: 0.5, y: 0}}
                    end={{x: 0.5, y: 1}}
                    style={styles.gradient}
                >
                    <Image source={require('./imgs/ArrowLeft.png')}/>
                </LinearGradient>
              </Pressable>
              <Text style={styles.text}>{title}</Text>

            </View>
            {additionalBTN === "settings" && 
              <Pressable style={styles.button} onPress={() => setLocalPage("settings")}>
                <LinearGradient
                  colors={[colors.background, colors.surfaceMuted]}
                  start={{ x: 0.5, y: 0 }}
                  end={{ x: 0.5, y: 1 }}
                  style={styles.gradient}
                >
                  <Feather
                    name="settings"
                    size={20}
                    color={colors.textSecondary}
                  />
                </LinearGradient>
              </Pressable>
            
            }
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
      width: "100%",
      flexDirection: "row",
      alignItems: "center",
    },
    screen: {
      width: "100%",
      flexDirection: 'row',
      alignItems: 'center',
      position: 'absolute',
      top: 0,
      left: 0,
    },
    text: {
        color: colors.textPrimary,
        fontSize: typography.sizeXl,
        fontFamily: typography.familyBold,
        marginLeft: spacing.xl,
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
    button: {
      position: "absolute",
      right: 0
    }
});