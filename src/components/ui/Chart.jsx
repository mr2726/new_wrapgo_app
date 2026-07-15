import {View, Text, StyleSheet, Pressable} from "react-native";
import React from "react";
import { colors, radius, spacing, typography } from "../../styles/theme";

export const Chart = ({ data }) => {
  const [activeIndex, setActiveIndex] = React.useState(null);

  const fallbackData = React.useMemo(
    () => [
      { lable: "Week 1", value: 42, data: "42km" },
      { lable: "Week 2", value: 58, data: "58km" },
      { lable: "Week 3", value: 78, data: "78km" },
      { lable: "Week 4", value: 50, data: "50km" },
    ],
    []
  );

  const sourceData = Array.isArray(data) && data.length > 0 ? data : fallbackData;

  const chartData = sourceData.map((item, index) => ({
    label: item?.label || item?.lable || `Week ${index + 1}`,
    value: Number(item?.value) || 0,
    displayData: item?.data,
  }));

  React.useEffect(() => {
    if (activeIndex !== null && activeIndex >= chartData.length) {
      setActiveIndex(null);
    }
  }, [activeIndex, chartData.length]);

  const values = chartData.map((item) => item.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);

  const getBarHeight = (value) => {
    const minHeight = 84;
    const maxHeight = 166;

    if (maxValue === minValue) {
      return (minHeight + maxHeight) / 2;
    }

    const ratio = (value - minValue) / (maxValue - minValue);
    return minHeight + ratio * (maxHeight - minHeight);
  };

  const formatActiveValue = (value) => {
    if (value >= 1000) {
      return `$${Math.round(value / 1000)}k`;
    }

    return `$${Math.round(value)}k`;
  };

  const getActiveDisplayValue = (item) => {
    if (item.displayData) {
      return item.displayData;
    }

    return formatActiveValue(item.value);
  };

  return (
    <View style={styles.card}>
      <View style={styles.chartRow}>
        {chartData.map((item, index) => {
          const isActive = index === activeIndex;
          const barHeight = getBarHeight(item.value);

          return (
            <View key={`${item.label}-${index}`} style={styles.barColumn}>
              {isActive && (
                <View style={styles.activeValueWrap}>
                  <View style={styles.activeValueBubble}>
                    <Text style={styles.activeValueText}>{getActiveDisplayValue(item)}</Text>
                  </View>
                  <View style={styles.activeBubbleArrow} />
                </View>
              )}

              <Pressable onPress={() => setActiveIndex(index)} style={styles.pressArea}>
                <View style={styles.barShell}>
                  <View style={[styles.barTrack, { height: barHeight }, isActive && styles.barTrackActive]}> 
                    <View style={[styles.barFill, isActive && styles.barFillActive]} />
                  </View>
                  <View style={[styles.barDot, isActive && styles.barDotActive]} />
                </View>
              </Pressable>

              <Text style={[styles.weekLabel, isActive && styles.weekLabelActive]}>{item.label}</Text>
            </View>
          );
        })}
      </View>

      <View style={styles.bottomLine} />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: "100%",
    backgroundColor: "#0A0C0F",
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
    borderWidth: 1,
    borderColor: "#111319",
  },
  chartRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    minHeight: 218,
  },
  barColumn: {
    width: "23%",
    alignItems: "center",
  },
  pressArea: {
    width: "100%",
    alignItems: "center",
  },
  barShell: {
    width: "84%",
    alignItems: "center",
    justifyContent: "flex-start",
    position: "relative",
  },
  barTrack: {
    width: "100%",
    borderRadius: radius.pill,
    backgroundColor: "#202228",
    borderWidth: 1,
    borderColor: "#5C6068",
    justifyContent: "flex-start",
    alignItems: "center",
    overflow: "hidden",
    position: "relative",
  },
  barTrackActive: {
    borderColor: colors.accent,
  },
  barFill: {
    width: "100%",
    height: "100%",
    borderRadius: radius.pill,
    backgroundColor: "transparent",
  },
  barFillActive: {
    backgroundColor: colors.accent,
  },
  barDot: {
    width: 12,
    height: 12,
    borderRadius: radius.full,
    backgroundColor: colors.accent,
    position: "absolute",
    top: -6,
    left: "50%",
    transform: [{ translateX: -6 }],
    borderWidth: 2,
    borderColor: "#0A0C0F",
  },
  barDotActive: {
    width: 16,
    height: 16,
    top: -8,
    transform: [{ translateX: -8 }],
  },
  weekLabel: {
    marginTop: spacing.md,
    color: "#7E838E",
    fontSize: typography.sizeSm,
    fontFamily: typography.familyRegular,
  },
  weekLabelActive: {
    color: colors.textPrimary,
    fontFamily: typography.familyMedium,
  },
  activeValueWrap: {
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  activeValueBubble: {
    backgroundColor: colors.accent,
    borderRadius: 100,
    paddingVertical: 7,
    paddingHorizontal: spacing.md,
    // borderRadius: radius.pill,
  },
  activeValueText: {
    color: colors.black,
    fontSize: typography.sizeSm,
    fontFamily: typography.familyMedium,
  },
  activeBubbleArrow: {
    marginTop: -1,
    width: 0,
    height: 0,
    borderLeftWidth: 7,
    borderRightWidth: 7,
    borderTopWidth: 9,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: colors.accent,
  },
  bottomLine: {
    marginTop: spacing.md,
    width: "100%",
    borderBottomWidth: 1,
    borderBottomColor: "#1C1F27",
  },
});