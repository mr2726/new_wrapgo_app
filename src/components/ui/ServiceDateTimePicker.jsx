import React from 'react';
import {Platform, Pressable, StyleSheet, Text, View} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import {colors, typography} from '../../styles/theme';

const mergeDateAndTime = (baseDate, valueDate) => {
    const nextDate = new Date(baseDate);
    nextDate.setHours(valueDate.getHours());
    nextDate.setMinutes(valueDate.getMinutes());
    nextDate.setSeconds(0);
    nextDate.setMilliseconds(0);
    return nextDate;
};

const mergeTimeIntoDate = (baseDate, valueDate) => {
    const nextDate = new Date(baseDate);
    nextDate.setFullYear(valueDate.getFullYear());
    nextDate.setMonth(valueDate.getMonth());
    nextDate.setDate(valueDate.getDate());
    nextDate.setSeconds(0);
    nextDate.setMilliseconds(0);
    return nextDate;
};

const formatDate = (value) => {
    const day = String(value.getDate()).padStart(2, '0');
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const year = value.getFullYear();

    return `${day}/${month}/${year}`;
};

const formatTime = (value) => {
    return value.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    });
};

export const ServiceDateTimePicker = ({label, value, onChange}) => {
    const safeValue = value instanceof Date && !Number.isNaN(value.getTime()) ? value : new Date();
    const [activePicker, setActivePicker] = React.useState(null);

    const handleIOSDateChange = (_, selectedDate) => {
        if (!selectedDate) {
            return;
        }

        onChange?.(mergeTimeIntoDate(safeValue, selectedDate));
    };

    const handleIOSTimeChange = (_, selectedDate) => {
        if (!selectedDate) {
            return;
        }

        onChange?.(mergeDateAndTime(safeValue, selectedDate));
    };

    const handleAndroidDateChange = (event, selectedDate) => {
        setActivePicker(null);

        if (event?.type !== 'set' || !selectedDate) {
            return;
        }

        onChange?.(mergeTimeIntoDate(safeValue, selectedDate));
    };

    const handleAndroidTimeChange = (event, selectedDate) => {
        setActivePicker(null);

        if (event?.type !== 'set' || !selectedDate) {
            return;
        }

        onChange?.(mergeDateAndTime(safeValue, selectedDate));
    };

    return (
        <View style={styles.wrapper}>
            {label ? <Text style={styles.label}>{label}</Text> : null}

            <View style={styles.card}>
                <View style={styles.row}>
                    <Pressable style={styles.field} onPress={() => setActivePicker('date')}>
                        <Text style={styles.fieldLabel}>Date</Text>
                        <Text style={styles.fieldValue}>{formatDate(safeValue)}</Text>
                    </Pressable>

                    <Pressable style={styles.field} onPress={() => setActivePicker('time')}>
                        <Text style={styles.fieldLabel}>Time</Text>
                        <Text style={styles.fieldValue}>{formatTime(safeValue)}</Text>
                    </Pressable>
                </View>

                {Platform.OS === 'ios' ? (
                    activePicker === 'date' ? (
                        <View style={styles.pickerWrapper}>
                            <DateTimePicker
                                value={safeValue}
                                mode="date"
                                display="spinner"
                                onChange={handleIOSDateChange}
                                textColor={colors.textPrimary}
                                themeVariant="dark"
                                style={styles.iosPicker}
                            />
                            <Pressable style={styles.doneButton} onPress={() => setActivePicker(null)}>
                                <Text style={styles.doneText}>Done</Text>
                            </Pressable>
                        </View>
                    ) : activePicker === 'time' ? (
                        <View style={styles.pickerWrapper}>
                            <DateTimePicker
                                value={safeValue}
                                mode="time"
                                display="spinner"
                                onChange={handleIOSTimeChange}
                                textColor={colors.textPrimary}
                                themeVariant="dark"
                                style={styles.iosPicker}
                            />
                            <Pressable style={styles.doneButton} onPress={() => setActivePicker(null)}>
                                <Text style={styles.doneText}>Done</Text>
                            </Pressable>
                        </View>
                    ) : null
                ) : (
                    activePicker === 'date' ? (
                        <DateTimePicker
                            value={safeValue}
                            mode="date"
                            display="spinner"
                            onChange={handleAndroidDateChange}
                            themeVariant="dark"
                            style={styles.androidPicker}
                        />
                    ) : activePicker === 'time' ? (
                        <DateTimePicker
                            value={safeValue}
                            mode="time"
                            display="spinner"
                            onChange={handleAndroidTimeChange}
                            themeVariant="dark"
                            style={styles.androidPicker}
                        />
                    ) : null
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        marginTop: 14,
        width: '100%',
    },
    label: {
        marginBottom: 8,
        color: colors.textSecondary,
        fontSize: typography.sizeMd,
        fontFamily: typography.familyRegular,
    },
    card: {
        borderRadius: 20,
        backgroundColor: '#141416',
        borderWidth: 1,
        borderColor: '#222428',
        overflow: 'hidden',
        paddingVertical: 10,
        paddingHorizontal: 10,
    },
    row: {
        flexDirection: 'row',
        gap: 10,
    },
    field: {
        flex: 1,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#282b30',
        backgroundColor: '#1b1d21',
        paddingVertical: 12,
        paddingHorizontal: 12,
    },
    fieldLabel: {
        color: '#8d949f',
        fontSize: 12,
        fontFamily: typography.familyRegular,
    },
    fieldValue: {
        marginTop: 4,
        color: colors.textPrimary,
        fontSize: typography.sizeMd,
        fontFamily: typography.familyMedium,
    },
    pickerWrapper: {
        marginTop: 10,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#282b30',
        backgroundColor: '#1b1d21',
    },
    iosPicker: {
        alignSelf: 'stretch',
        height: 185,
    },
    androidPicker: {
        marginTop: 10,
        alignSelf: 'stretch',
        backgroundColor: '#1b1d21',
    },
    doneButton: {
        paddingTop: 6,
        paddingBottom: 12,
        alignItems: 'center',
    },
    doneText: {
        color: colors.accent,
        fontSize: typography.sizeMd,
        fontFamily: typography.familySemiBold,
    },
});
