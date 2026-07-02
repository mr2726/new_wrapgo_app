import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {colors} from '../../styles/theme';

export function Week() {
  const today = new Date();

  // Преобразуем:
  // Monday = 0
  // Tuesday = 1
  // ...
  // Sunday = 6
  const currentDay = (today.getDay() + 6) % 7;

  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  return (
    <View style={styles.container}>
      {days.map((day, index) => (
        <View key={index} style={styles.dayContainer}>
          <Text
            style={[
              styles.dayText,
              index === currentDay && styles.activeText,
            ]}>
            {day}
          </Text>

          {index === currentDay && <View style={styles.indicator} />}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 6,
    paddingHorizontal: 10,
  },

  dayContainer: {
    alignItems: 'center',
    minWidth: 24,
  },

  dayText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontFamily: 'LufgaMedium',
  },

  activeText: {
    color: colors.textPrimary,
  },

  indicator: {
    position: 'absolute',
    bottom: -7,
    width: 20,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.accent,
  },
});