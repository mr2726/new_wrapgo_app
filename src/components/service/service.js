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
            status: "Pending",
            email: email,
            carid: null,
            fleet: null,
            zonehourse: 0,
            wrapped: false,
        }]);
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
        }
    })
    if (error) {
        throw error;
    }
}

// - Verify OTP
export const verifyOTP = async (email, token) => {
    const {data, error} = await supabase.auth.verifyOtp({
        email,
        token,
        type: "email"
    })
    if (error) {
        console.log(error.message);
        return false
    }
    return true;
}

// - Reset Password
export const changePassword = async (newPassword) => {
    const {error} = await supabase.auth.updateUser({
        password: newPassword,
    })
    if (error) {
        console.log(error.message);
    }
}