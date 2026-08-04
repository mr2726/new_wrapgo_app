import {View, Text, StyleSheet, ScrollView} from 'react-native';
import React from 'react';
import {colors} from '../../styles/theme';

// COMPONENTS
import {Menu} from '../../components/ui/menu';
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
    return (
        <View style={styles.screen}>
            {localPage === "home" && <Home email="user@example.com" setLocalPage={setLocalPage} />}
            {localPage === "profile" && <Profile setLocalPage={setLocalPage}/>}
            {localPage === "settings" && (
                <SettingsContent
                    setPage={setLocalPage}
                    onLogout={onLogout}
                    onAccountDeleted={onAccountDeleted}
                />
            )}
            {localPage === "contracts" && <Contracts setLocalPage={setLocalPage} contractId={38} />}
            {localPage === "wallet" && <Payment setLocalPage={setLocalPage} />}

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
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: colors.background,
        marginVertical: 25,
    },
});