import {View, Text, Pressable, StyleSheet} from 'react-native';
import React from 'react';
import {Feather} from '@expo/vector-icons';

// COMPONENTS
import {LOGO}  from '../../components/ui/LOGO';
import {Input_} from '../../components/ui/inputs';
import {Button_} from '../../components/ui/buttons';
// ------------------------------------------------------------------------

// BACKEND
import {signInWithEmail} from '../../components/service/service';
// ------------------------------------------------------------------------

export default function Signin({setLocalPage, setPage}) {
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');

    const handleSignIn = async () => {
        try {
            await signInWithEmail(email, password);
            setPage('success');
        } catch (error) {
            console.error('Sign in error:', error);
            alert(error?.message || 'Failed to sign in');
        }
    };

    return (
        <View style={styles.screen}>
            <View style={styles.welcomeBlock}>
                <Text style={{color: '#fff', fontSize: 24, fontWeight: 'bold'}}>Welcome to </Text>
                <LOGO />
            </View>
            <Input_ label="Email" value={email} onChangeText={setEmail} secureTextEntry={false} error={''}  icon={<Feather name="mail" size={20} color="#626262" />} />
            <Input_ label="Password" value={password} onChangeText={setPassword} secureTextEntry={true} error={''} icon={<Feather name="lock" size={20} color="#626262" />} isPassword={true} />
            <Pressable onPress={() => {alert('Comming soon')}} style={{alignSelf: 'flex-end', marginTop: 2}}>
                <Text style={styles.forgotPassword}>Forgot Password?</Text>
            </Pressable>
            <Button_ style={{marginTop: 20}} title="Sign In" onPress={handleSignIn} dispable={false} />
            <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 20}}>
                <Text style={{color: '#727272', fontSize: 12}}>Don't have an account?</Text>
                <Pressable onPress={() => setLocalPage('signup')}><Text style={{color: '#39ff14', marginLeft: 5, fontSize: 12}}>Sign Up</Text></Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    welcomeBlock: {
        flexDirection: 'row',
        alignItems: 'center',
        position: 'absolute',
        top: 30,
    },
    forgotPassword: {
        fontSize: 12,
        color: '#727272',
        alignSelf: 'flex-end',
        marginTop: 0,
    }
});