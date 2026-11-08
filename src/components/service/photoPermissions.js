import {Alert, Linking} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export const showPhotoPermissionDenied = (permission, kind) => {
    const isCamera = kind === 'camera';
    const name = isCamera ? 'Camera' : 'Photo library';
    const purpose = isCamera ? 'take photos' : 'choose photos';

    if (permission.canAskAgain === false) {
        Alert.alert(
            `${name} permission blocked`,
            `Open app settings and allow ${name.toLowerCase()} access to ${purpose}.`,
            [
                {text: 'Cancel', style: 'cancel'},
                {
                    text: 'Open settings',
                    onPress: () => {
                        Linking.openSettings().catch((error) => {
                            Alert.alert('Could not open settings', error?.message || 'Please open app settings manually.');
                        });
                    },
                },
            ]
        );
        return;
    }

    Alert.alert('Permission required', `Allow ${name.toLowerCase()} access to ${purpose}.`);
};

export const requestPhotoPermission = async (kind) => {
    const permission = kind === 'camera'
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
        showPhotoPermissionDenied(permission, kind);
    }

    return permission.granted;
};
