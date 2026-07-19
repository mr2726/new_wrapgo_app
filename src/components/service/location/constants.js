import * as Location from 'expo-location';

export const LOCATION_TASK_NAME = 'wrapgo-background-location-task';
export const LOCATION_QUEUE_STORAGE_KEY = 'wrapgo-location-update-queue';
export const LOCATION_PERMISSION_REQUESTED_KEY = 'wrapgo-location-permission-requested';
export const MAX_QUEUED_LOCATION_UPDATES = 1000;

export const LOCATION_TASK_OPTIONS = {
    accuracy: Location.Accuracy.BestForNavigation,
    activityType: Location.ActivityType.AutomotiveNavigation,
    deferredUpdatesDistance: 0,
    deferredUpdatesInterval: 0,
    deferredUpdatesTimeout: 0,
    distanceInterval: 5,
    mayShowUserSettingsDialog: true,
    pausesUpdatesAutomatically: false,
    showsBackgroundLocationIndicator: true,
    timeInterval: 15000,
    foregroundService: {
        killServiceOnDestroy: false,
        notificationTitle: 'WrapGo location tracking is active',
        notificationBody: 'Driver GPS updates continue while the app is in the background.',
        notificationColor: '#39FF14',
    },
};