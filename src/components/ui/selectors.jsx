import { Text, View, Pressable } from "react-native";
import React from "react";
import { Feather } from "@expo/vector-icons";
import {colors, radius, typography} from '../../styles/theme';

export const Selector_ = ({
    options,
    value,
    onValueChange,
    style,
    label,
    error,
    errorText,
}) => {
    const [isOpen, setIsOpen] = React.useState(false);
    return (
        <View style={{ width: '100%' }}>
            <Text
                style={{
                marginBottom: 5,
                color: colors.textSecondary,
                fontSize: typography.sizeLg,
                }}>
                {label}
            </Text>
            <Pressable            
                style={{
                    backgroundColor: colors.surface,
                    padding: 12,
                    borderRadius: radius.pill,
                    height: 55,
                    width: '100%',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    ...style,
                }}            
                onPress={() => {
                    setIsOpen(!isOpen);
                }}        >
                <Text style={{color: colors.textPrimary, marginBottom: 4}}>{value ? value.label : ''}</Text>
                <Feather name={isOpen ? 'chevron-up' : 'chevron-down'} size={20} color={colors.textSecondary} />
            </Pressable>

            {isOpen && (
                <View style={{backgroundColor: colors.surface, marginTop: 4, borderRadius: radius.md, position: 'absolute', width: '100%', zIndex: 1, top: 90}}>
                    {options.map((option) => (
                        <Pressable
                            key={option.value}
                            style={{padding: 12}}
                            onPress={() => {
                                onValueChange(option);
                                setIsOpen(false);
                            }}
                        >
                            <Text style={{color: colors.textPrimary}}>{option.label}</Text>
                        </Pressable>
                    ))}
                </View>
            )}
        </View>
    );
};
