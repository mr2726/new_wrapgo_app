export const INITIAL_SIGNIN_VALUES = {
    email: '',
    password: '',
};

export const SIGNIN_FIELDS = [
    {
        key: 'email',
        label: 'Email',
        icon: 'mail',
        isPassword: false,
    },
    {
        key: 'password',
        label: 'Password',
        icon: 'lock',
        isPassword: true,
    },
];

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateSignInForm(emailValue, passwordValue) {
    const errors = {};
    const nextEmail = emailValue.trim();

    if (!nextEmail) {
        errors.email = 'Email is required';
    } else if (!emailRegex.test(nextEmail)) {
        errors.email = 'Enter a valid email address';
    }

    if (!passwordValue) {
        errors.password = 'Password is required';
    }

    return errors;
}
