import {View, Text, Image, StyleSheet} from 'react-native';
import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {supabase} from "../../components/service/supabase";

// COMPONENTS
import {Week} from '../../components/ui/Week';
import HowItWorks from '../../components/screens/HowItWorks';
import {StatusBar_} from '../../components/ui/statusBar';
// import Map from '../../../components/ui/Map';
// ----------------------------------------------------------

// SCREENS
import Loading from '../../components/screens/Loading';
// ----------------------------------------------------------

// SERVICES
import {getUserDataById} from '../../components/service/service';
// ----------------------------------------------------------

export default function Home({email, setLocalPage}) {
    const [showHowItWorks, setShowHowItWorks] = React.useState(false);
    const [loading, setLoading] = React.useState(true);
    const [userData, setUserData] = React.useState(null);

    React.useEffect(() => {
        const initialize = async () => {
            try {
                const completed = await AsyncStorage.getItem(
                    'howItWorksCompleted'
                );

                setShowHowItWorks(completed !== 'true');

                const {
                    data: { user },
                } = await supabase.auth.getUser();

                if (user) {
                    const userData = await getUserDataById(user.id);

                    setUserData(userData);
                    // Add user data to the LocalStorage to get access from any screen
                    await AsyncStorage.setItem(
                        'userData',
                        JSON.stringify(userData)
                    );
                    console.log('User Data:', userData);
                }
            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }
        };

        initialize();
    }, []);

    if (loading) {
        return <Loading />;
    }
    const text = 'Your Profile in Review, Please wait\nfor the verification process to complete.';
    return (
        <View>
            <View style={styles.header}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Image source={{uri: userData.selfie}} style={styles.selfie} />
                    <Text style={[styles.text, { marginLeft: 8 }]}>Welcome, {userData.name}</Text>
                </View>
            </View>
            <Week />
            {
                userData.status === 'In Progress' && (
                    <StatusBar_ 
                        style={{ marginTop: 25 }}
                        title="Verification Needed"
                        description={text}
                        icon="alert-triangle"
                        color="#DC362E"
                        onPress={() => alert(text)}
                    />
                )
            }

            {/* <Map /> */}










            {showHowItWorks && (
                <HowItWorks
                    onComplete={async () => {
                        await AsyncStorage.setItem(
                            'howItWorksCompleted',
                            'true'
                        );

                        setShowHowItWorks(false);
                    }}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    text: {
        fontSize: 16,
        color: '#fff',
        fontFamily: 'LufgaRegular',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    selfie: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
});