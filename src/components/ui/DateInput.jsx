import {View, Text, StyleSheet, Pressable, Modal, Platform} from 'react-native';
import React from 'react';
import {colors, spacing, typography} from '../../styles/theme';
import {Feather} from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const parseDate = (value) => {
    if (!value || typeof value !== 'string') {
        return new Date();
    }

    const [year, month, day] = value.split('-').map(Number);
    if (!year || !month || !day) {
        return new Date(value);
    }

    return new Date(year, month - 1, day);
};

export function DateInput({label, value, onChange, error, style, placeholder}) {
    const [isPickerVisible, setIsPickerVisible] = React.useState(false);
    const [selectedDate, setSelectedDate] = React.useState(() => parseDate(value));

    React.useEffect(() => {
        if (value) {
            setSelectedDate(parseDate(value));
        }
    }, [value]);

    const handleDateChange = (event, date) => {
        if (Platform.OS === 'android') {
            setIsPickerVisible(false);
            if (event?.type === 'set' && date) {
                setSelectedDate(date);
                onChange?.(formatDate(date));
            }
            return;
        }

        if (date) {
            setSelectedDate(date);
        }
    };

    const handleConfirm = () => {
        onChange?.(formatDate(selectedDate));
        setIsPickerVisible(false);
    };

    return (
        <View style={[{width: '100%', marginBottom: spacing.lg}, style]}>
            {label && (
                <Text style={{marginBottom: 5, color: error ? colors.error : colors.textSecondary, fontSize: typography.sizeLg}}>
                    {label}
                </Text>
            )}
            <Pressable
                onPress={() => setIsPickerVisible(true)}
                style={{position: 'relative', width: '100%'}}
            >
                <Feather
                    name="calendar"
                    size={20}
                    color={colors.icons}
                    style={{position: 'absolute', left: 15, top: 17, zIndex: 1}}
                />
                <View
                    style={{
                        width: '100%',
                        minHeight: 55,
                        justifyContent: 'center',
                        paddingVertical: 15,
                        paddingLeft: 45,
                        paddingRight: 15,
                        borderWidth: 1,
                        borderColor: error ? colors.error : colors.border,
                        borderRadius: 50,
                        backgroundColor: colors.surface,
                    }}
                >
                    <Text
                        style={{
                            color: value ? colors.textPrimary : colors.textMuted,
                            fontSize: typography.sizeMd,
                            fontFamily: typography.familyRegular,
                        }}
                    >
                        {value || placeholder}
                    </Text>
                </View>
            </Pressable>
            {error && <Text style={{color: colors.error, marginTop: 5}}>{error}</Text>}

            <Modal
                visible={isPickerVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setIsPickerVisible(false)}
            >

                <Pressable
                    style={{backgroundColor: colors.background, borderRadius: 16, padding: spacing.lg}}
                    onPress={() => {}}
                >
                    <DateTimePicker
                        value={selectedDate}
                        mode="date"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={handleDateChange}
                        maximumDate={new Date()}
                        style={{alignSelf: 'stretch'}}
                    />
                    {Platform.OS === 'ios' && (
                        <View style={{flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.sm, marginTop: spacing.md}}>
                            <Pressable onPress={() => setIsPickerVisible(false)} style={{paddingVertical: 10, paddingHorizontal: 14}}>
                                <Text style={{color: colors.textSecondary, fontSize: typography.sizeMd}}>Cancel</Text>
                            </Pressable>
                            <Pressable onPress={handleConfirm} style={{paddingVertical: 10, paddingHorizontal: 14}}>
                                <Text style={{color: colors.accent, fontSize: typography.sizeMd, fontFamily: typography.familySemiBold}}>Done</Text>
                            </Pressable>
                        </View>
                    )}
                </Pressable>
                
            </Modal>
        </View>
    );
}