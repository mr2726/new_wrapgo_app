import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Network from 'expo-network';

import {
    LOCATION_QUEUE_STORAGE_KEY,
    MAX_QUEUED_LOCATION_UPDATES,
} from './constants';
import {uploadDriverLocationUpdates} from '../service';

let isFlushingQueue = false;

const readQueuedLocationUpdates = async () => {
    const rawValue = await AsyncStorage.getItem(LOCATION_QUEUE_STORAGE_KEY);

    if (!rawValue) {
        return [];
    }

    try {
        const parsedValue = JSON.parse(rawValue);
        return Array.isArray(parsedValue) ? parsedValue : [];
    } catch (error) {
        console.warn('Failed to parse queued location updates:', error);
        return [];
    }
};

const writeQueuedLocationUpdates = async (updates) => {
    await AsyncStorage.setItem(
        LOCATION_QUEUE_STORAGE_KEY,
        JSON.stringify(updates)
    );
};

const normalizeLocationUpdate = (location) => {
    const coords = location?.coords || {};

    if (typeof coords.latitude !== 'number' || typeof coords.longitude !== 'number') {
        return null;
    }

    return {
        latitude: coords.latitude,
        longitude: coords.longitude,
        altitude: coords.altitude ?? null,
        accuracy: coords.accuracy ?? null,
        heading: coords.heading ?? null,
        speed: coords.speed ?? null,
        timestamp: location?.timestamp || Date.now(),
        mocked: location?.mocked ?? false,
        source: 'expo-location-task',
    };
};

export const enqueueLocationUpdates = async (updates) => {
    if (!Array.isArray(updates) || updates.length === 0) {
        return;
    }

    const queuedUpdates = await readQueuedLocationUpdates();
    const nextQueue = [...queuedUpdates, ...updates].slice(-MAX_QUEUED_LOCATION_UPDATES);

    await writeQueuedLocationUpdates(nextQueue);
};

export const flushLocationQueue = async () => {
    if (isFlushingQueue) {
        return false;
    }

    isFlushingQueue = true;

    try {
        const networkState = await Network.getNetworkStateAsync();

        if (!networkState.isConnected || networkState.isInternetReachable === false) {
            return false;
        }

        const queuedUpdates = await readQueuedLocationUpdates();

        if (queuedUpdates.length === 0) {
            return true;
        }

        const pendingUpdates = [...queuedUpdates];
        const chunkSize = 25;

        while (pendingUpdates.length > 0) {
            const chunk = pendingUpdates.slice(0, chunkSize);
            await uploadDriverLocationUpdates(chunk);
            pendingUpdates.splice(0, chunk.length);
            await writeQueuedLocationUpdates(pendingUpdates);
        }

        return true;
    } finally {
        isFlushingQueue = false;
    }
};

export const persistLocationBatch = async (locations) => {
    const normalizedUpdates = (Array.isArray(locations) ? locations : [])
        .map(normalizeLocationUpdate)
        .filter(Boolean);

    if (normalizedUpdates.length === 0) {
        return;
    }

    await enqueueLocationUpdates(normalizedUpdates);

    try {
        await flushLocationQueue();
    } catch (error) {
        console.warn('Location queue flush failed, updates remain queued:', error);
    }
};