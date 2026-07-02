import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { useFonts } from 'expo-font';
import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Content from './src/Pages/Content';

export default function App() {
  const [fontsLoaded] = useFonts({
    LufgaThin: require('./src/styles/lufga/LufgaThin.ttf'),
    LufgaExtraLight: require('./src/styles/lufga/LufgaExtraLight.ttf'),
    LufgaLight: require('./src/styles/lufga/LufgaLight.ttf'),
    LufgaRegular: require('./src/styles/lufga/LufgaRegular.ttf'),
    LufgaMedium: require('./src/styles/lufga/LufgaMedium.ttf'),
    LufgaSemiBold: require('./src/styles/lufga/LufgaSemiBold.ttf'),
    LufgaBold: require('./src/styles/lufga/LufgaBold.ttf'),
    LufgaExtraBold: require('./src/styles/lufga/LufgaExtraBold.ttf'),
    LufgaBlack: require('./src/styles/lufga/LufgaBlack.ttf'),
  });

  const [isLogined, setIsLogined] = React.useState(null);

  React.useEffect(() => {
    const checkLogin = async () => {
      const logged = await AsyncStorage.getItem('isLogined');
      setIsLogined(logged === 'true');
    };

    checkLogin();
  }, []);

  if (!fontsLoaded || isLogined === null) {
    return null;
  }

  return (
    <View style={styles.screen}>
      <Content
        isLogined={isLogined}
        setIsLogined={setIsLogined}
      />
      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#040404',
  },
});