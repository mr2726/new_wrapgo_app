import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import {Button_} from './src/components/ui/buttons'; 
import {Input_} from './src/components/ui/inputs'; 
import {Selector_} from './src/components/ui/selectors';
import {SettingsButton} from './src/components/ui/settingsButton';
import {InfoInput_} from './src/components/ui/infoInputs';
import React from 'react';
import {Feather} from '@expo/vector-icons';


export default function App() {
  const [text, setText] = React.useState('');
  const [selectedOption, setSelectedOption] = React.useState(null);
  const selectorOptions = [
    { label: "Option 1", value: "option1" },
    { label: "Option 2", value: "option2" },
    { label: "Option 3", value: "option3" },
  ];
  return (
    <View style={styles.container}>
      <View style={styles.formWrap}>
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
      </View>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#040404',
    alignItems: 'center',
    justifyContent: 'center',
  },
  formWrap: {
    width: '100%',
    gap: 12,
  },
});
