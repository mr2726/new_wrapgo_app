import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import {Button_} from './src/components/ui/buttons'; 
import {Input_} from './src/components/ui/inputs'; 
import React from 'react';
import {Feather} from '@expo/vector-icons';


export default function App() {
  const [text, setText] = React.useState('');
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
      </View>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  formWrap: {
    width: '90%',
    maxWidth: 420,
    gap: 12,
  },
});
