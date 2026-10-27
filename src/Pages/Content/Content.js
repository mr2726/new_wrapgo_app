import {View, Text, StyleSheet, ScrollView} from 'react-native';
import React from 'react';
import {colors} from '../../styles/theme';

// COMPONENTS
import {Menu} from '../../components/ui/menu';
import {useKeyboardVisible} from '../../components/ui/layout';
// ----------------------------------------------------------

// SCREENS
import Home from './Home';
import Profile from './Profile';
import SettingsContent from './SettingsScreens/SettingsContent';
import Contracts from './Contracts';
import Payment from './Payment';
// ----------------------------------------------------------

export default function ContentPage({onLogout, onAccountDeleted}) {
    const [localPage, setLocalPage] = React.useState("home"); // home | howitswork | faq | contactus | profile
    const keyboardVisible = useKeyboardVisible();
    return (
        <View style={styles.screen}>
            <View style={styles.body}>
                {localPage === "home" && <Home email="user@example.com" setLocalPage={setLocalPage} onSessionExpired={onLogout} />}
                {localPage === "profile" && <Profile setLocalPage={setLocalPage}/>}
                {localPage === "settings" && (
                    <SettingsContent
                        setPage={setLocalPage}
                        onLogout={onLogout}
                        onAccountDeleted={onAccountDeleted}
                    />
                )}
                {localPage === "contracts" && <Contracts setLocalPage={setLocalPage} />}
                {localPage === "wallet" && <Payment setLocalPage={setLocalPage} />}
            </View>

            {!keyboardVisible && (
                <Menu
                    items={[
                        { title: 'Home', img: 'Home', target: "home" },
                        { title: 'Contract', img: 'Settings', target: "contracts" },
                        { title: 'Wallet', img: 'Info', target: "wallet" },
                        { title: 'Profile', img: 'User', target: "profile" },
                    ]}
                    onSelect={(item) => setLocalPage(item.target)}
                    current = {localPage}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: colors.background,
        marginTop: 25,
    },
    body: {
        flex: 1,
        minHeight: 0,
    },
});