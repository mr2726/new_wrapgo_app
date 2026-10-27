import {View, Text, StyleSheet, Image, Alert, Linking} from "react-native";
import React, {useEffect} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {colors} from "../../styles/theme";

import {MapMark} from '../Icons';
import {Button_} from "../ui/buttons";
import {ServiceDateTimePicker} from "../ui/ServiceDateTimePicker";
import {Selector_} from "../ui/selectors";

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

const buildCoordinate = (service) => {
    if (!service) {
        return null;
    }

    if (Array.isArray(service) && service.length >= 2) {
        return buildCoordinate({latitude: service[0], longitude: service[1]});
    }

    const latitude = service.latitude ?? service.lat ?? service.service_lat ?? service.serviceLatitude;
    const longitude = service.longitude ?? service.lng ?? service.lon ?? service.lan ?? service.service_lng ?? service.service_lon ?? service.serviceLongitude;
    const coordinates = service.coordinates ?? service.coords;

    if (latitude == null || longitude == null) {
        if (Array.isArray(coordinates) && coordinates.length >= 2) {
            return buildCoordinate({latitude: coordinates[0], longitude: coordinates[1]});
        }

        return null;
    }

    const parsedLatitude = Number(latitude);
    const parsedLongitude = Number(longitude);

    if (!Number.isFinite(parsedLatitude) || !Number.isFinite(parsedLongitude)) {
        return null;
    }

    return {latitude: parsedLatitude, longitude: parsedLongitude};
};

const normalizeServiceOptions = (services) => (Array.isArray(services) ? services : [])
    .map((service, index) => ({
        value: String(service?.id ?? service?.service_id ?? service?.name ?? index),
        label: String(service?.name ?? service?.title ?? service?.city ?? `Service ${index + 1}`),
        coordinate: buildCoordinate(service),
        raw: service,
    }));

const openServiceNavigation = async (service) => {
    const coordinate = buildCoordinate(service);

    if (!coordinate) {
        throw new Error('Selected service does not have map coordinates.');
    }

    const destination = `${coordinate.latitude},${coordinate.longitude}`;
    const encodedLabel = encodeURIComponent(service?.name || service?.title || 'Service');
    const mapUrls = [
        `geo:0,0?q=${destination}(${encodedLabel})`,
        `comgooglemaps://?daddr=${destination}&directionsmode=driving`,
        `yandexmaps://maps.yandex.com/?rtext=~${destination}&rtt=auto`,
        `maps://?daddr=${destination}&dirflg=d`,
        `https://www.google.com/maps/dir/?api=1&destination=${destination}`,
    ];

    for (const url of mapUrls) {
        try {
            if (await Linking.canOpenURL(url)) {
                await Linking.openURL(url);
                return;
            }
        } catch (error) {
            console.warn('Failed to open map URL:', error);
        }
    }

    throw new Error('No map application is available on this phone.');
};

export const ServiceVisit = ({contract}) => {
    const [serviceLocation, setServiceLocation] = React.useState([]);
    const [selectedService, setSelectedService] = React.useState(null);
    const [visitDateTime, setVisitDateTime] = React.useState(new Date());
    const [serviceLocationError, setServiceLocationError] = React.useState(null);
    const [isServiceLocationLoading, setIsServiceLocationLoading] = React.useState(true);
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const serviceOptions = React.useMemo(() => normalizeServiceOptions(serviceLocation), [serviceLocation]);
    const selectedServiceOption = React.useMemo(
        () => serviceOptions.find((option) => option.raw === selectedService) || serviceOptions[0] || null,
        [selectedService, serviceOptions]
    );

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

            try {
                await openServiceNavigation(targetService);
                Alert.alert('Success', 'Service visit details sent successfully.');
            } catch (navigationError) {
                console.warn('Failed to open service navigation:', navigationError);
                Alert.alert(
                    'Message sent',
                    'Service visit details were sent, but no map application could be opened.'
                );
            }
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
        <View style={styles.container}>
            <View style={styles.scrollContent}>
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
            <Selector_
                label="Select service"
                options={serviceOptions}
                value={selectedServiceOption}
                onValueChange={(option) => setSelectedService(option.raw)}
            />
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
            </View>
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
        paddingBottom: 16,
        paddingTop: 0,
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