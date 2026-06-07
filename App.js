import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
// COMPONENTS
// import {Menu} from './src/components/ui/menu';
// import {TopSlide} from './src/components/ui/topSlide';
// import {Button_} from './src/components/ui/buttons'; 
// import {Input_} from './src/components/ui/inputs'; 
// import {Selector_} from './src/components/ui/selectors';
// import {SettingsButton} from './src/components/ui/settingsButton';
// import {InfoInput_} from './src/components/ui/infoInputs';
// import {StatusBar_} from './src/components/ui/statusBar';
// import {InfoButton_} from './src/components/ui/infoButton';
// import {ToggleButton_} from './src/components/ui/toggleButton';
// import {SegmentedControl_} from './src/components/ui/segmentedControl';
// ------------------------------------------------------------------------

import Content from './src/Pages/Content';

import React from 'react';
import {Feather} from '@expo/vector-icons';


export default function App() {
  // const [text, setText] = React.useState('');
  // const [selectedOption, setSelectedOption] = React.useState("option1");
  // const selectorOptions = [
  //   { label: "Option 1", value: "option1" },
  //   { label: "Option 2", value: "option2" },
  //   { label: "Option 3", value: "option3" },
  // ];
  // const [page, setPage] = React.useState("home");
  // const [onboardingPage, setOnboardingPage] = React.useState(1);
  return (
    <View style={styles.screen}>
      <Content />








      {/* <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <TopSlide slidePage={onboardingPage} />
        <Button_ title="Button" onPress={() => alert('Button pressed!')} dispable={false} />
          <Input_
            placeholder=""
            value={text}
            onChangeText={setText}
            label="Label"
            error={false}
            errorText="The error message"
            icon={<Feather name="phone" size={20} color="#626262" />}
            isPassword={true}
          />
          <Selector_ options={selectorOptions} value={selectedOption} onValueChange={setSelectedOption} label="Select an option" />
          <SettingsButton title="Settings" onPress={() => alert('Settings pressed!')} icon="user" />
          <InfoInput_ label="Info" value="Some information" onPress={() => alert('Info pressed!')}/>
          <StatusBar_ title="Status" description="This is a status message." icon="alert-triangle" color="#ff0000" />
          <InfoButton_ onPress={() => alert('Info button pressed!')} />
          <ToggleButton_ onPress={(value) => console.log(value)} dispable={false} />
          <SegmentedControl_ options={selectorOptions} value={selectedOption} onValueChange={setSelectedOption} label="Segmented Control" />
        </ScrollView>
        <Menu
          items={[
            {title: 'Home', img: 'Home'},
            {title: 'Contract', img: 'Settings'},
            {title: 'Wallet', img: 'Info'},
            {title: 'Profile', img: 'User'},
          ]}
          onSelect={(item) => setPage(String(item.img).toLowerCase())}
        /> */}
      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#040404',
  },
  container: {
    flex: 1,
    width: '100%',
  },
  content: {
    paddingVertical: 32,
    paddingBottom: 120,
  },
});
