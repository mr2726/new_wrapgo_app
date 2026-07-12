import {supabase} from './supabase';

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
        }]);
    if (error) {
        throw error;
    }
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
    bucket = process.env.EXPO_PUBLIC_SUPABASE_STORAGE_BUCKET || 'vehicle-documents',
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
    return data;
}