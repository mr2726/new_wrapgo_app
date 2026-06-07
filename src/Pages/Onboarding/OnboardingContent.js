import {StyleSheet, View} from 'react-native';
import React from 'react';
// COMPONENTS
import {TopSlide} from '../../components/ui/topSlide';
import {Button_} from '../../components/ui/buttons';
// ------------------------------------------------------------------------
// Pages
import Page1 from './Page1';
import Page2 from './Page2';
import Page3 from './Page3';
// ------------------------------------------------------------------------
const OnboardingContent = ({ setPage }) => {
    const [slidePage, setSlidePage] = React.useState(0);
    const buttonHandler = () => {
        if (slidePage === 2) {
            setPage("signupandsignin");
        }
        setSlidePage((prev) => (prev + 1) % 3);
    }
    return (
        <View style={styles.screen}>
            <TopSlide slidePage={slidePage} />
            {slidePage === 0 && <Page1 />}
            {slidePage === 1 && <Page2 />}
            {slidePage === 2 && <Page3 />}
            <Button_ title={slidePage === 2 ? "Done" : "Next"} onPress={() => buttonHandler()} dispable={false} />
        </View>
    );
}

export default OnboardingContent;

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: '#040404',
        paddingTop: 16,
        marginBottom: 16,
    },
});