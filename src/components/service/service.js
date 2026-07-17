import {supabase} from './supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_BUCKET = 'documents';
const VEHICLE_DOCS_PREFIX = 'vehicle-documents';

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
            phone: updatedData.PhoneNumber,
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

// LOGOUT
export const logout = async () => {
        const {error} = await supabase.auth.signOut();
        await AsyncStorage.clear();
    await AsyncStorage.setItem('howItWorksCompleted', 'true');

        return {error};
};