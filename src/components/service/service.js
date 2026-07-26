import {supabase} from './supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {buildWeeklyStatsUpdate} from './location/weeklyStats';

const STORAGE_BUCKET = 'documents';
const VEHICLE_DOCS_PREFIX = 'vehicle-documents';
const LOCATION_UPDATES_TABLE = 'driver_location_updates';
const MIN_TRACKING_SPEED_KMH = 0; // For production change this to 10.

const normalizeWeeklyStat = (weeklyStat) => {
    if (!weeklyStat) {
        return {distance: [], hours: []};
    }

    if (typeof weeklyStat === 'string') {
        try {
            const parsed = JSON.parse(weeklyStat);
            return {
                distance: Array.isArray(parsed?.distance) ? parsed.distance : [],
                hours: Array.isArray(parsed?.hours) ? parsed.hours : [],
            };
        } catch {
            return {distance: [], hours: []};
        }
    }

    return {
        distance: Array.isArray(weeklyStat?.distance) ? weeklyStat.distance : [],
        hours: Array.isArray(weeklyStat?.hours) ? weeklyStat.hours : [],
    };
};

const cacheUserData = async (driverData) => {
    if (!driverData) return;

    const normalizedUserData = {
        ...driverData,
        weeklyStat: normalizeWeeklyStat(driverData?.weeklyStat),
    };

    await AsyncStorage.setItem('userData', JSON.stringify(normalizedUserData));
};

const cacheLatestDriverLocation = async (latitude, longitude, timestamp) => {
    const userDataString = await AsyncStorage.getItem('userData');

    if (!userDataString) {
        return;
    }

    try {
        const userData = JSON.parse(userDataString);
        const nextUserData = {
            ...userData,
            lat: latitude,
            lan: longitude,
            lastLocationTimestamp: timestamp,
        };

        await AsyncStorage.setItem('userData', JSON.stringify(nextUserData));
    } catch (error) {
        console.warn('Failed to cache latest driver location:', error);
    }
};

const getCurrentDriverContext = async () => {
    const {data: authData, error: authError} = await supabase.auth.getUser();

    if (authError) {
        throw authError;
    }

    const currentUser = authData?.user;

    if (!currentUser) {
        return null;
    }

    return {
        userId: currentUser.id,
        email: currentUser.email || null,
    };
};

const refreshAndCacheDriverByEmail = async (email) => {
    if (!email) return null;

    const {data, error} = await supabase
        .from('drivers')
        .select('*')
        .eq('email', email)
        .single();

    if (error) {
        throw error;
    }

    await cacheUserData(data);
    return data;
};

const refreshAndCacheDriverByUserId = async (userId) => {
    if (!userId) return null;

    const {data, error} = await supabase
        .from('drivers')
        .select('*')
        .eq('userid', userId)
        .single();

    if (error) {
        throw error;
    }

    await cacheUserData(data);
    return data;
};

const listAllFilesUnderPrefix = async (bucket, prefix) => {
    const queue = [prefix];
    const filePaths = [];

    while (queue.length > 0) {
        const currentPrefix = queue.shift();
        const {data, error} = await supabase.storage
            .from(bucket)
            .list(currentPrefix, {
                limit: 1000,
                offset: 0,
                sortBy: {column: 'name', order: 'asc'},
            });

        if (error) {
            const message = String(error.message || '').toLowerCase();
            if (message.includes('not found')) {
                continue;
            }
            throw error;
        }

        for (const item of data || []) {
            const fullPath = currentPrefix ? `${currentPrefix}/${item.name}` : item.name;

            if (item?.metadata) {
                filePaths.push(fullPath);
            } else {
                queue.push(fullPath);
            }
        }
    }

    return filePaths;
};

const removeFilesByPrefixes = async (bucket, prefixes) => {
    const allFiles = [];

    for (const prefix of prefixes) {
        if (!prefix) continue;
        const files = await listAllFilesUnderPrefix(bucket, prefix);
        allFiles.push(...files);
    }

    if (allFiles.length === 0) {
        return;
    }

    const chunkSize = 100;
    for (let i = 0; i < allFiles.length; i += chunkSize) {
        const chunk = allFiles.slice(i, i + chunkSize);
        const {error} = await supabase.storage.from(bucket).remove(chunk);
        if (error) {
            throw error;
        }
    }
};

// Signup function
export async function signUpWithEmail(email, password) {
    const {data, error} = await supabase.auth.signUp({
        email,
        password,
    });
    if (error) {
        throw error;
    }
    return data.user;
}

// Signin function
export async function signInWithEmail(email, password) {
    const {data, error} = await supabase.auth.signInWithPassword({
        email,
        password,
    });
    if (error) {
        throw error;
    }
    return data.user;
}

// Save data of user in drivers table after signup
export async function saveDriverData(userId, fullName, email) {
    const {data, error} = await supabase
        .from('drivers')
        .insert([{
            userid: userId,
            name: fullName,
            contractid: null,
            totaldistance: 0,
            lat: null,
            lan: null,
            phone: null,
            kmtoday: 0,
            status: 'Pending',
            email: email,
            carid: null,
            fleet: null,
            zonehourse: 0,
            current_week_distance: 0,
            current_week_hourse: 0,
            wrapped: false,
            dateofbirsday: null,
            weeklyStat: {
                "hours": [
                    {"data": "0 h","label": "Week 1","value": 0},
                    {"data": "0 h","label": "Week 2","value": 0},
                    {"data": "0 h","label": "Week 3","value": 0},
                    {"data": "0 h","label": "Week 4","value": 0}
                ],
                "distance": [
                    {"data": "0km","label": "Week 1","value": 0},
                    {"data": "0km","label": "Week 2","value": 0},
                    {"data": "0km","label": "Week 3","value": 0},
                    {"data": "0km","label": "Week 4","value": 0}
                ]
            },
            score: {
                "safety": 0,
                "activity": 0,
                "acceptance": 0
            }
        }]);
    if (error) {
        throw error;
    }

    await refreshAndCacheDriverByUserId(userId);
    return data;
}

// Get Vehicle data by OTP
export async function getVehicleDataByOTP(otp) {
    const {data, error} = await supabase
        .from('vehicles')
        .select('*')
        .eq('invite_code', otp)
        .single();
    if (error) {
        throw error;
    }
    return data;
}

// Upload image file to Supabase Storage
export async function uploadImageToStorage({
    uri,
    storagePath,
    bucket = STORAGE_BUCKET,
    contentType = 'image/jpeg',
}) {
    const response = await fetch(uri);
    const arrayBuffer = await response.arrayBuffer();

    const {error} = await supabase.storage
        .from(bucket)
        .upload(storagePath, arrayBuffer, {
            contentType,
            upsert: true,
        });

    if (error) {
        if (String(error.message || '').toLowerCase().includes('bucket')) {
            throw new Error(`Bucket "${bucket}" not found. Create this bucket in Supabase Storage or set EXPO_PUBLIC_SUPABASE_STORAGE_BUCKET.`);
        }
        throw error;
    }

    const {data} = supabase.storage.from(bucket).getPublicUrl(storagePath);
    return {
        path: storagePath,
        publicUrl: data.publicUrl,
    };
}

// Update Driver data in drivers table after verification
export async function updateDriverData(updatedData) {
    // const id = user.id;
    const {data, error} = await supabase
        .from('drivers')
        .update([{
            name: updatedData.fullName,
            phone: updatedData.phoneNumber,
            email: updatedData.email,
            dateofbirsday: updatedData.birthDate,
            contractid: null,
            totaldistance: 0,
            lat: null,
            lan: null,
            kmtoday: 0,
            status: 'In Progress',
            carid: updatedData.otp,
            fleet: null,
            zonehourse: 0,
            wrapped: false,
            selfie: updatedData.selfie || null,
        }])
        .eq('email', updatedData.email);
    if (error) {
        throw error;
    }

    await refreshAndCacheDriverByEmail(updatedData.email);
    return data;
}

// Update Vehicle data in vehicles table after verification
export async function updateVehicleData(vehicleId, updatedData) {
    const {data, error} = await supabase
        .from('vehicles')
        .update([{
            left_img: updatedData.vehiclePhoto.leftSide,
            right_img: updatedData.vehiclePhoto.rightSide,
            used: true,
            registration_front: updatedData.vehicleRegistrationDoc.frontView,
            registration_back: updatedData.vehicleRegistrationDoc.backView,
            signeddriveremail: updatedData.email,
            status: 'in progress',
        }])
        .eq('invite_code', vehicleId);
    if (error) {
        throw error;
    }
    return data;
}

// Update Personal Information in drivers table after changing in the settings screen.
export async function updatePersonalInfo(email, updatedData) {
    const {data, error} = await supabase
        .from('drivers')
        .update([{
            name: updatedData.fullName,
            phone: updatedData.PhoneNumber,
            dateofbirsday: updatedData.birthDate,
        }])
        .eq('email', email);
    if (error) {
        throw error;
    }

    await refreshAndCacheDriverByEmail(email);
    return data;
}

// Update fleet code (carid) in drivers table and refresh cached user data.
export async function updateDriverFleetCode(email, fleetCode) {
    const {data, error} = await supabase
        .from('drivers')
        .update([{
            carid: fleetCode,
        }])
        .eq('email', email);

    if (error) {
        throw error;
    }

    await refreshAndCacheDriverByEmail(email);
    return data;
}

// Update profile selfie URL in drivers table.
export async function updateDriverSelfie(email, selfieUrl) {
    const {data, error} = await supabase
        .from('drivers')
        .update([{
            selfie: selfieUrl,
        }])
        .eq('email', email);

    if (error) {
        throw error;
    }

    await refreshAndCacheDriverByEmail(email);

    return data;
}


// Change Password functions
// - Send OTP to email
export const sendOTP = async (email) => {
    const {error} = await supabase.auth.signInWithOtp({
        email,
        options: {
            shouldCreateUser: false,
        },
    });
    if (error) {
        throw error;
    }
};

// - Verify OTP
export const verifyOTP = async (email, token) => {
    const {error} = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'email',
    });
    if (error) {
        console.log(error.message);
        return false;
    }
    return true;
};

// - Reset Password
export const changePassword = async (newPassword) => {
    const {error} = await supabase.auth.updateUser({
        password: newPassword,
    });
    if (error) {
        console.log(error.message);
    }
};

// Get all UserData from drivers table
export async function getUserDataById(id) {
    const {data, error} = await supabase
        .from('drivers')
        .select('*')
        .eq('userid', id)
        .single();
    if (error) {
        throw error;
    }

    await cacheUserData(data);
    return data;
}

export async function deleteAccount() {
    const {data: authData, error: authError} = await supabase.auth.getUser();
    if (authError) {
        throw authError;
    }

    const currentUser = authData?.user;
    if (!currentUser?.id || !currentUser?.email) {
        throw new Error('User context not found for account deletion.');
    }

    const {data, error} = await supabase.functions.invoke('delete_account', {
        body: {
            storageBucket: STORAGE_BUCKET,
            storagePrefix: VEHICLE_DOCS_PREFIX,
        },
    });

    if (error) {
        throw error;
    }

    await supabase.auth.signOut();
    await AsyncStorage.clear();

    return {
        success: true,
        warnings: Array.isArray(data?.warnings) ? data.warnings : [],
    };
}

export async function uploadDriverLocationUpdates(locationUpdates) {
    if (!Array.isArray(locationUpdates) || locationUpdates.length === 0) {
        return {uploaded: 0};
    }

    const sortedUpdates = [...locationUpdates]
        .filter((update) => update && Number.isFinite(Number(update.timestamp)))
        .sort((a, b) => Number(a.timestamp) - Number(b.timestamp));

    if (sortedUpdates.length === 0) {
        return {uploaded: 0};
    }

    const driverContext = await getCurrentDriverContext();

    if (!driverContext?.userId && !driverContext?.email) {
        throw new Error('No authenticated driver is available for location upload yet.');
    }

    const latestUpdate = sortedUpdates[sortedUpdates.length - 1];
    const row = {
        user_id: latestUpdate.userId || driverContext.userId || null,
        driver_email: latestUpdate.email || driverContext.email || null,
        latitude: latestUpdate.latitude,
        longitude: latestUpdate.longitude,
        altitude: latestUpdate.altitude,
        accuracy: latestUpdate.accuracy,
        heading: latestUpdate.heading,
        speed: latestUpdate.speed,
        recorded_at: new Date(latestUpdate.timestamp).toISOString(),
        payload: latestUpdate,
    };

    if (!row.driver_email) {
        throw new Error('Driver email is required to upsert the latest location row.');
    }

    const {data: existingRow, error: existingRowError} = await supabase
        .from(LOCATION_UPDATES_TABLE)
        .select('id, latitude, longitude, speed, recorded_at, payload')
        .eq('driver_email', row.driver_email)
        .order('recorded_at', {ascending: false})
        .limit(1)
        .maybeSingle();

    if (existingRowError) {
        const message = String(existingRowError.message || '').toLowerCase();

        if (message.includes('relation') || message.includes('schema cache')) {
            throw new Error(
                `Supabase table "${LOCATION_UPDATES_TABLE}" is missing. Apply supabase/sql/20260717_driver_location_updates.sql before enabling continuous tracking in production.`
            );
        }

        throw existingRowError;
    }

    if (existingRow?.id) {
        const {error: updateLocationError} = await supabase
            .from(LOCATION_UPDATES_TABLE)
            .update(row)
            .eq('id', existingRow.id);

        if (updateLocationError) {
            throw updateLocationError;
        }
    } else {
        const {error: insertLocationError} = await supabase
            .from(LOCATION_UPDATES_TABLE)
            .insert(row);

        if (insertLocationError) {
            const message = String(insertLocationError.message || '').toLowerCase();

            if (message.includes('relation') || message.includes('schema cache')) {
                throw new Error(
                    `Supabase table "${LOCATION_UPDATES_TABLE}" is missing. Apply supabase/sql/20260717_driver_location_updates.sql before enabling continuous tracking in production.`
                );
            }

            throw insertLocationError;
        }
    }

    const identifierColumn = driverContext.userId ? 'userid' : 'email';
    const identifierValue = driverContext.userId || driverContext.email;

    const {data: driverRow, error: driverRowError} = await supabase
        .from('drivers')
        .select('weeklyStat, current_week_distance, current_week_hourse')
        .eq(identifierColumn, identifierValue)
        .maybeSingle();

    if (driverRowError) {
        throw driverRowError;
    }

    const previousPayload = existingRow?.payload || {};
    const previousPoint = {
        latitude: Number.isFinite(Number(previousPayload?.latitude))
            ? Number(previousPayload.latitude)
            : Number(existingRow?.latitude),
        longitude: Number.isFinite(Number(previousPayload?.longitude))
            ? Number(previousPayload.longitude)
            : Number(existingRow?.longitude),
        speed: Number.isFinite(Number(previousPayload?.speed))
            ? Number(previousPayload.speed)
            : Number(existingRow?.speed),
        timestamp: Number.isFinite(Number(previousPayload?.timestamp))
            ? Number(previousPayload.timestamp)
            : new Date(existingRow?.recorded_at || 0).getTime(),
    };

    const weeklyStatsUpdate = buildWeeklyStatsUpdate({
        weeklyStat: driverRow?.weeklyStat,
        currentWeekDistance: driverRow?.current_week_distance,
        currentWeekHours: driverRow?.current_week_hourse,
        previousPoint,
        locationUpdates: sortedUpdates,
        minSpeedKmh: MIN_TRACKING_SPEED_KMH,
        referenceTimestamp: latestUpdate.timestamp,
    });

    const {error: updateDriverError} = await supabase
        .from('drivers')
        .update([{
            lat: latestUpdate.latitude,
            lan: latestUpdate.longitude,
            current_week_distance: weeklyStatsUpdate.currentWeekDistance,
            current_week_hourse: weeklyStatsUpdate.currentWeekHours,
            weeklyStat: weeklyStatsUpdate.weeklyStat,
        }])
        .eq(identifierColumn, identifierValue);

    if (updateDriverError) {
        throw updateDriverError;
    }

    await cacheLatestDriverLocation(
        latestUpdate.latitude,
        latestUpdate.longitude,
        latestUpdate.timestamp
    );

    return {uploaded: 1};
}

// Get Tasks
// const { data, error } = await supabase
//     .from("tasks")
//     .select("*");

//     if (error) {
//     console.error(error);
//     } else {
//     console.log(data);
//     }


export const getTasks = async () => {
    const {data, error} = await supabase
        .from('tasks')
        .select('id, created_at, task_name, task_target, task_value_column_name')
        .order('created_at', {ascending: false});

    if (error) {
        const message = String(error.message || '').toLowerCase();

        if (message.includes('relation') && message.includes('tasks')) {
            throw new Error('Table "tasks" does not exist in Supabase.');
        }

        throw error;
    }

    return Array.isArray(data) ? data : [];
}

export const getCampaignById = async (campaignId) => {
    if (campaignId == null || campaignId === '') {
        return null;
    }

    const {data, error} = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', campaignId)
        .maybeSingle();

    if (error) {
        const message = String(error.message || '').toLowerCase();

        if (message.includes('relation') && message.includes('campaigns')) {
            throw new Error('Table "campaigns" does not exist in Supabase.');
        }

        throw error;
    }

    return data || null;
};


// LOGOUT
export const logout = async () => {
        const {error} = await supabase.auth.signOut();
        await AsyncStorage.clear();
    await AsyncStorage.setItem('howItWorksCompleted', 'true');

        return {error};
};