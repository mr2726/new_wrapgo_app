import { Text, View, Pressable } from "react-native";
import React from "react";
import { Feather } from "@expo/vector-icons";

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
                color:'#939393',
                fontSize: 16,
                }}>
                {label}
            </Text>
            <Pressable            
                style={{
                    backgroundColor: '#151515',
                    padding: 12,
                    borderRadius: 55,
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
                <Text style={{color: '#fff', marginBottom: 4}}>{value ? value.label : ''}</Text>
                <Feather name={isOpen ? 'chevron-up' : 'chevron-down'} size={20} color="#939393" />
            </Pressable>

            {isOpen && (
                <View style={{backgroundColor: '#151515', marginTop: 4, borderRadius: 8, position: 'absolute', width: '100%', zIndex: 1, top: 90}}>
                    {options.map((option) => (
                        <Pressable
                            key={option.value}
                            style={{padding: 12}}
                            onPress={() => {
                                onValueChange(option);
                                setIsOpen(false);
                            }}
                        >
                            <Text style={{color: '#fff'}}>{option.label}</Text>
                        </Pressable>
                    ))}
                </View>
            )}
        </View>
    );
};
