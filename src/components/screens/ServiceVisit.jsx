import {View, Text, StyleSheet, Image, ScrollView, Alert, useWindowDimensions} from "react-native";
import React, {useEffect} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {colors} from "../../styles/theme";

import {MapMark} from '../Icons';
import ServiceRouteMap from "../ui/ServiceRouteMap";
import {Button_} from "../ui/buttons";
import {ServiceDateTimePicker} from "../ui/ServiceDateTimePicker";

import {getServiceLocation, getVehicleDataByOTP, sendServiceVisitTelegramMessage} from "../service/service";

const formatDateTime = (value) => {
    const safeValue = value instanceof Date ? value : new Date();

    const day = String(safeValue.getDate()).padStart(2, '0');
    const month = String(safeValue.getMonth() + 1).padStart(2, '0');
    const year = safeValue.getFullYear();

    const formattedTime = safeValue.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    });

    return `${day}/${month}/${year} ${formattedTime}`;
};

const pickValue = (...values) => {
    for (const value of values) {
        if (value == null) {
            continue;
        }

        const normalized = String(value).trim();

        if (normalized) {
            return normalized;
        }
    }

    return 'Not specified';
};

export const ServiceVisit = ({contract}) => {
    const {height} = useWindowDimensions();
    const scrollAreaHeight = Math.max(320, Math.round(height * 0.62));

    const [serviceLocation, setServiceLocation] = React.useState([]);
    const [selectedService, setSelectedService] = React.useState(null);
    const [visitDateTime, setVisitDateTime] = React.useState(new Date());
    const [serviceLocationError, setServiceLocationError] = React.useState(null);
    const [isServiceLocationLoading, setIsServiceLocationLoading] = React.useState(true);
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    useEffect(() => {
        let isMounted = true;

        const fetchServiceLocation = async () => {
            try {
                const location = await getServiceLocation();

                if (!isMounted) {
                    return;
                }

                const normalizedLocation = Array.isArray(location)
                    ? location
                    : Array.isArray(location?.data)
                        ? location.data
                        : location
                            ? [location]
                            : [];

                setServiceLocation(normalizedLocation);
                setSelectedService((currentService) => currentService || normalizedLocation[0] || null);
                setServiceLocationError(null);
            } catch (error) {
                if (!isMounted) {
                    return;
                }

                console.warn('Failed to load wrap_services:', error);
                setServiceLocation([]);
                setServiceLocationError(error?.message || 'Failed to load services.');
            } finally {
                if (isMounted) {
                    setIsServiceLocationLoading(false);
                }
            }
        };

        fetchServiceLocation();

        return () => {
            isMounted = false;
        };
    }, [contract]);

    const handleSendServiceVisit = React.useCallback(async () => {
        if (isSubmitting) {
            return;
        }

        const targetService = selectedService || serviceLocation[0] || null;

        if (!targetService) {
            Alert.alert('Service not selected', 'Please select a service first.');
            return;
        }

        setIsSubmitting(true);

        try {
            const userDataString = await AsyncStorage.getItem('userData');
            const userData = userDataString ? JSON.parse(userDataString) : null;

            let vehicleBrand = pickValue(
                contract?.vehicle_brand,
                contract?.vehicleBrand,
                contract?.brand,
                userData?.vehicleMake,
                userData?.car_brand,
                userData?.brand
            );

            let vehicleModel = pickValue(
                contract?.vehicle_model,
                contract?.vehicleModel,
                contract?.model,
                userData?.vehicleModel,
                userData?.car_model
            );

            const inviteCode = String(userData?.carid || '').trim();

            if (inviteCode) {
                const vehicleData = await getVehicleDataByOTP(inviteCode);
                vehicleBrand = pickValue(vehicleData?.mark, vehicleBrand);
                vehicleModel = pickValue(vehicleData?.model, vehicleModel);
            }

            const phone = pickValue(userData?.phone, userData?.PhoneNumber, userData?.phoneNumber);
            const driverName = pickValue(userData?.name, userData?.fullName, userData?.fullname);
            const dateTimeLabel = formatDateTime(visitDateTime);

            const message = [
                `Vehicle brand: ${vehicleBrand}`,
                `Vehicle model: ${vehicleModel}`,
                `UserData phone: ${phone}`,
                `UserData name: ${driverName}`,
                `Date and time: ${dateTimeLabel}`,
                'For more details contat 094041644 or admin@wrapgo.am',
            ].join('\n');

            await sendServiceVisitTelegramMessage({
                botToken: targetService?.bot_token,
                chatId: targetService?.chatid ?? targetService?.chat_id,
                message,
            });

            Alert.alert('Success', 'Service visit details sent successfully.');
        } catch (error) {
            console.warn('Failed to send service visit details:', error);
            Alert.alert('Send failed', error?.message || 'Could not send service visit details.');
        } finally {
            setIsSubmitting(false);
        }
    }, [contract, isSubmitting, selectedService, serviceLocation, visitDateTime]);

    if (!contract) {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>Service Visit Contracts</Text>
                <Text style={styles.secondaryText}>No service visit contract found yet.</Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, {maxHeight: scrollAreaHeight}]}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={true}
                nestedScrollEnabled={true}
                keyboardShouldPersistTaps="handled"
            >
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
                <Image source={{uri: contract.document}} style={styles.image} />
                <View>
                    <Text style={styles.title}>{contract.name}</Text>
                    <Text style={styles.secondaryText}>{contract.city}</Text>
                </View>
            </View>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 10}}>
                <MapMark style={{marginTop: 10}} width={20} height={20} fill={colors.primary} />
                <Text style={styles.secondaryText}>Service Center Location</Text>
            </View>
            <ServiceRouteMap services={serviceLocation} onServiceChange={setSelectedService} />
            {isServiceLocationLoading ? (
                <Text style={styles.secondaryText}>Loading services...</Text>
            ) : null}
            {serviceLocationError ? (
                <Text style={styles.errorText}>{serviceLocationError}</Text>
            ) : null}

            <ServiceDateTimePicker
                label="Date and time"
                value={visitDateTime}
                onChange={setVisitDateTime}
            />

            <Button_
                title={isSubmitting ? 'Sending...' : 'Send to service'}
                onPress={handleSendServiceVisit}
                dispable={isSubmitting || isServiceLocationLoading || serviceLocation.length === 0}
                style={styles.submitButton}
            />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    image: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    container: {
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        backgroundColor: colors.surface,
        borderRadius: 8,
        // marginBottom: 80,
        overflow: 'hidden',
    },
    scrollContent: {
        paddingHorizontal: 15,
        paddingBottom: 56,
        marginBottom: 20,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.textPrimary,
    },
    secondaryText: {
        fontSize: 14,
        color: colors.textSecondary,
    },
    errorText: {
        marginTop: 8,
        fontSize: 12,
        color: '#ff7a7a',
    },
    submitButton: {
        marginTop: 16,
        marginBottom: 6,
    },
});