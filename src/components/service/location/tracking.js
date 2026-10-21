import AsyncStorage from '@react-native-async-storage/async-storage';
import {Platform} from 'react-native';
import * as Location from 'expo-location';
import * as Network from 'expo-network';
import * as TaskManager from 'expo-task-manager';

import {
    LOCATION_PERMISSION_REQUESTED_KEY,
    LOCATION_QUEUE_STORAGE_KEY,
    LOCATION_TASK_NAME,
    LOCATION_TASK_OPTIONS,
} from './constants';
import {flushLocationQueue} from './sync';
import './task';

export const hasRequestedLocationPermissionsBefore = async () => {
    const value = await AsyncStorage.getItem(LOCATION_PERMISSION_REQUESTED_KEY);
    return value === 'true';
};

export const requestLocationTrackingPermissions = async () => {
    await AsyncStorage.setItem(LOCATION_PERMISSION_REQUESTED_KEY, 'true');

    const foreground = await Location.requestForegroundPermissionsAsync();
    let background = await Location.getBackgroundPermissionsAsync();

    if (foreground.granted) {
        background = await Location.requestBackgroundPermissionsAsync();

        if (
            Platform.OS === 'ios' &&
            !background.granted &&
            foreground?.ios?.scope === 'whenInUse'
        ) {
            throw new Error(
                'iOS granted only "When In Use" location access. To enable live tracking, open Settings > WrapGo > Location and choose "Always".'
            );
        }
    }

    return {
        foreground,
        background,
    };
};

export const getLocationTrackingPrerequisites = async () => {
    const [
        foregroundPermission,
        backgroundPermission,
        servicesEnabled,
        taskManagerAvailable,
        backgroundLocationAvailable,
        trackingStarted,
    ] = await Promise.all([
        Location.getForegroundPermissionsAsync(),
        Location.getBackgroundPermissionsAsync(),
        Location.hasServicesEnabledAsync(),
        TaskManager.isAvailableAsync(),
        Location.isBackgroundLocationAvailableAsync(),
        Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME),
    ]);

    return {
        backgroundLocationAvailable,
        backgroundScope: backgroundPermission?.ios?.scope || 'none',
        canAskBackgroundAgain: backgroundPermission.canAskAgain,
        canAskForegroundAgain: foregroundPermission.canAskAgain,
        foregroundScope: foregroundPermission?.ios?.scope || 'none',
        hasBackgroundPermission: backgroundPermission.granted,
        hasForegroundPermission: foregroundPermission.granted,
        servicesEnabled,
        taskManagerAvailable,
        trackingStarted,
    };
};

export const startLocationTrackingIfNeeded = async () => {
    const taskManagerAvailable = await TaskManager.isAvailableAsync();

    if (!taskManagerAvailable) {
        throw new Error(
            'Expo TaskManager is unavailable in this build. Background location requires a development build or a standalone app, not Expo Go.'
        );
    }

    const backgroundLocationAvailable = await Location.isBackgroundLocationAvailableAsync();

    if (!backgroundLocationAvailable) {
        throw new Error(
            'Background location is unavailable in this build. Rebuild the app after applying the expo-location plugin configuration.'
        );
    }

    const trackingStarted = await Location.hasStartedLocationUpdatesAsync(
        LOCATION_TASK_NAME
    );

    if (trackingStarted) {
        return {
            alreadyRunning: true,
            started: false,
        };
    }

    await Location.startLocationUpdatesAsync(
        LOCATION_TASK_NAME,
        LOCATION_TASK_OPTIONS
    );

    return {
        alreadyRunning: false,
        started: true,
    };
};

export const ensureLocationTrackingStarted = async (existingStatus) => {
    const status = existingStatus || await getLocationTrackingPrerequisites();

    if (!status.hasForegroundPermission || !status.hasBackgroundPermission) {
        return {
            ready: false,
            status,
        };
    }

    if (!status.servicesEnabled) {
        return {
            ready: false,
            status,
        };
    }

    try {
        await startLocationTrackingIfNeeded();
    } catch (error) {
        return {
            ready: false,
            status: await getLocationTrackingPrerequisites(),
            error,
        };
    }

    try {
        await flushLocationQueue();
    } catch (error) {
        console.warn('Location queue flush failed after starting tracking:', error);
    }

    return {
        ready: true,
        status: {
            ...(await getLocationTrackingPrerequisites()),
            trackingStarted: true,
        },
    };
};

export const stopLocationTracking = async () => {
    const trackingStarted = await Location.hasStartedLocationUpdatesAsync(
        LOCATION_TASK_NAME
    );

    if (trackingStarted) {
        await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
    }

    await AsyncStorage.removeItem(LOCATION_QUEUE_STORAGE_KEY);
};

export const subscribeToLocationQueueSync = (onError) => {
    return Network.addNetworkStateListener(async (networkState) => {
        if (!networkState.isConnected || networkState.isInternetReachable === false) {
            return;
        }

        try {
            await flushLocationQueue();
        } catch (error) {
            if (typeof onError === 'function') {
                onError(error);
            }
        }
    });
};