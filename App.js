import { StatusBar } from 'expo-status-bar';
import { AppState, Linking, StyleSheet, View } from 'react-native';
import { useFonts } from 'expo-font';
import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import Content from './src/Pages/Content';
import LocationPermissionGate from './src/components/screens/LocationPermissionGate';
import {
  ensureLocationTrackingStarted,
  getLocationTrackingPrerequisites,
  hasRequestedLocationPermissionsBefore,
  requestLocationTrackingPermissions,
  subscribeToLocationQueueSync,
} from './src/components/service/location/tracking';

function AppContent() {
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
  const [trackingState, setTrackingState] = React.useState({
    loading: true,
    ready: false,
    status: null,
    errorMessage: '',
  });
  const queueSyncSubscriptionRef = React.useRef(null);
  const trackingReadyRef = React.useRef(false);

  React.useEffect(() => {
    trackingReadyRef.current = trackingState.ready;
  }, [trackingState.ready]);

  React.useEffect(() => {
    const checkLogin = async () => {
      const logged = await AsyncStorage.getItem('isLogined');
      setIsLogined(logged === 'true');
    };

    checkLogin();
  }, []);

  const refreshLocationTracking = React.useCallback(async ({
    requestPermissions = false,
  } = {}) => {
    try {
      setTrackingState((currentState) => ({
        ...currentState,
        loading: true,
        errorMessage: '',
      }));

      let status = await getLocationTrackingPrerequisites();
      const hasRequestedBefore = await hasRequestedLocationPermissionsBefore();
      const shouldAutoRequest =
        !hasRequestedBefore &&
        (!status.hasForegroundPermission || !status.hasBackgroundPermission);

      if (requestPermissions || shouldAutoRequest) {
        await requestLocationTrackingPermissions();
        status = await getLocationTrackingPrerequisites();
      }

      const result = await ensureLocationTrackingStarted(status);

      if (queueSyncSubscriptionRef.current) {
        queueSyncSubscriptionRef.current.remove();
        queueSyncSubscriptionRef.current = null;
      }

      if (result.ready) {
        queueSyncSubscriptionRef.current = subscribeToLocationQueueSync((error) => {
          console.warn('Location queue sync failed:', error);
        });
      }

      setTrackingState({
        loading: false,
        ready: result.ready,
        status: result.status,
        errorMessage: result.error?.message || '',
      });
    } catch (error) {
      const status = await getLocationTrackingPrerequisites().catch(() => null);

      setTrackingState({
        loading: false,
        ready: false,
        status,
        errorMessage:
          error?.message || 'Unable to initialize continuous location tracking.',
      });
    }
  }, []);

  React.useEffect(() => {
    refreshLocationTracking();

    // Settings changes (e.g. granting "Allow all the time") don't notify the app, so recheck on resume.
    const appStateSubscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active' && !trackingReadyRef.current) {
        refreshLocationTracking();
      }
    });

    return () => {
      appStateSubscription.remove();
      if (queueSyncSubscriptionRef.current) {
        queueSyncSubscriptionRef.current.remove();
        queueSyncSubscriptionRef.current = null;
      }
    };
  }, [refreshLocationTracking]);

  if (!fontsLoaded || isLogined === null) {
    return null;
  }

  if (!trackingState.ready) {
    return (
      <View style={styles.screen}>
        <LocationPermissionGate
          busy={trackingState.loading}
          errorMessage={trackingState.errorMessage}
          status={trackingState.status}
          onOpenSettings={() => Linking.openSettings()}
          onRetry={() => {
            const shouldRequestPermissions =
              !trackingState.status?.hasForegroundPermission ||
              !trackingState.status?.hasBackgroundPermission;

            refreshLocationTracking({
              requestPermissions: shouldRequestPermissions,
            });
          }}
        />
        <StatusBar style="light" />
      </View>
    );
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

export default function App() {
  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#040404',
  },
});