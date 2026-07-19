import * as TaskManager from 'expo-task-manager';

import {LOCATION_TASK_NAME} from './constants';
import {persistLocationBatch} from './sync';

if (!TaskManager.isTaskDefined(LOCATION_TASK_NAME)) {
    TaskManager.defineTask(LOCATION_TASK_NAME, async ({data, error}) => {
        if (error) {
            console.warn('Background location task error:', error);
            return;
        }

        const locations = data?.locations;

        if (!Array.isArray(locations) || locations.length === 0) {
            return;
        }

        await persistLocationBatch(locations);
    });
}