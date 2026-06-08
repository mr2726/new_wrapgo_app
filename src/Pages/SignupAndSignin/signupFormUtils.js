export const INITIAL_SIGNUP_VALUES = {
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateSignupForm(inputValues, isAgreed) {
    const errors = {};
    const fullName = inputValues.fullName.trim();
    const email = inputValues.email.trim();
    const password = inputValues.password;
    const confirmPassword = inputValues.confirmPassword;

    if (!fullName) {
        errors.fullName = 'Full Name is required';
    }

    if (!email) {
        errors.email = 'Email is required';
    } else if (!emailRegex.test(email)) {
        errors.email = 'Enter a valid email address';
    }

    if (!password) {
        errors.password = 'Password is required';
    } else if (password.length < 8) {
        errors.password = 'Minimum 8 characters';
    }

    if (!confirmPassword) {
        errors.confirmPassword = 'Confirm Password is required';
    } else if (confirmPassword !== password) {
        errors.confirmPassword = 'Passwords do not match';
    }

    if (!isAgreed) {
        errors.isAgreed = 'Accept Terms of Service';
    }

    return errors;
}

export function isSignupFormValid(inputValues, isAgreed) {
    return (
        inputValues.fullName.trim().length > 0 &&
        emailRegex.test(inputValues.email.trim()) &&
        inputValues.password.length >= 8 &&
        inputValues.confirmPassword.length > 0 &&
        inputValues.confirmPassword === inputValues.password &&
        isAgreed
    );
}
