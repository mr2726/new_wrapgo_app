import React from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppState, View, StyleSheet } from "react-native";
import MapView from "react-native-maps/lib/MapView";
import { MapMarker as Marker } from "react-native-maps/lib/MapMarker";
import { PROVIDER_GOOGLE } from "react-native-maps/lib/ProviderConstants";

const FALLBACK_COORDINATE = {
  latitude: 40.18874434273496,
  longitude: 44.516992688037945,
};

const buildCoordinate = (latitude, longitude) => {
  const parsedLatitude = Number(latitude);
  const parsedLongitude = Number(longitude);

  if (!Number.isFinite(parsedLatitude) || !Number.isFinite(parsedLongitude)) {
    return null;
  }

  return {
    latitude: parsedLatitude,
    longitude: parsedLongitude,
  };
};

const darkMapStyle = [
  {
    elementType: "geometry",
    stylers: [{ color: "#0b0b0b" }],
  },
  {
    elementType: "labels.icon",
    stylers: [{ visibility: "off" }],
  },
  {
    elementType: "labels.text.fill",
    stylers: [{ color: "#5f5f5f" }],
  },
  {
    elementType: "labels.text.stroke",
    stylers: [{ color: "#0b0b0b" }],
  },
  {
    featureType: "administrative",
    elementType: "geometry",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "poi",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "poi.park",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#303030" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#202020" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#3d3d3d" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#2a2a2a" }],
  },
  {
    featureType: "transit",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#111111" }],
  },
];

function UserMarker() {
  return (
    <View
      collapsable={false}
      style={{
        width: 44,
        height: 44,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* Свечение */}
      <View
        style={{
          position: "absolute",
          width: 30,
          height: 30,
          borderRadius: 15,
          backgroundColor: "rgba(0,255,90,0.25)",
        }}
      />

      {/* Зеленый круг */}
      <View
        style={{
          width: 20,
          height: 20,
          borderRadius: 10,
          backgroundColor: "#00FF57",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {/* Стрелка */}
        <View
          style={{
            width: 0,
            height: 0,
            borderLeftWidth: 5,
            borderRightWidth: 5,
            borderBottomWidth: 10,
            borderLeftColor: "transparent",
            borderRightColor: "transparent",
            borderBottomColor: "#111",
            transform: [{ rotate: "45deg" }],
          }}
        />
      </View>
    </View>
  );
}

export default function Map({ coordinate }) {
  const mapRef = React.useRef(null);
  const [userCoordinate, setUserCoordinate] = React.useState(
    buildCoordinate(coordinate?.latitude, coordinate?.longitude) ||
      FALLBACK_COORDINATE
  );

  const syncCoordinateFromStorage = React.useCallback(async () => {
    try {
      const userDataString = await AsyncStorage.getItem("userData");

      if (!userDataString) {
        return;
      }

      const userData = JSON.parse(userDataString);
      const nextCoordinate = buildCoordinate(userData?.lat, userData?.lan);

      if (nextCoordinate) {
        setUserCoordinate((currentCoordinate) => {
          if (
            currentCoordinate.latitude === nextCoordinate.latitude &&
            currentCoordinate.longitude === nextCoordinate.longitude
          ) {
            return currentCoordinate;
          }

          return nextCoordinate;
        });
      }
    } catch (error) {
      console.warn("Failed to sync map coordinate:", error);
    }
  }, []);

  React.useEffect(() => {
    const nextCoordinate = buildCoordinate(
      coordinate?.latitude,
      coordinate?.longitude
    );

    if (nextCoordinate) {
      setUserCoordinate(nextCoordinate);
    }
  }, [coordinate?.latitude, coordinate?.longitude]);

  React.useEffect(() => {
    syncCoordinateFromStorage();

    const intervalId = setInterval(() => {
      syncCoordinateFromStorage();
    }, 15000);

    const appStateSubscription = AppState.addEventListener(
      "change",
      (nextAppState) => {
        if (nextAppState === "active") {
          syncCoordinateFromStorage();
        }
      }
    );

    return () => {
      clearInterval(intervalId);
      appStateSubscription.remove();
    };
  }, [syncCoordinateFromStorage]);

  React.useEffect(() => {
    if (!mapRef.current) {
      return;
    }

    mapRef.current.animateToRegion(
      {
        latitude: userCoordinate.latitude,
        longitude: userCoordinate.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      },
      500
    );
  }, [userCoordinate]);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        customMapStyle={darkMapStyle}
        showsCompass={false}
        showsBuildings={true}
        showsTraffic={false}
        showsIndoors={false}
        showsPointsOfInterest={false}
        initialRegion={{
          latitude: userCoordinate.latitude,
          longitude: userCoordinate.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
      >
        <Marker
          coordinate={userCoordinate}
          anchor={{ x: 0.5, y: 0.5 }}
          tracksViewChanges={true}
        >
          <UserMarker />
        </Marker>
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 240,
    // marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#101010",
    borderWidth: 1,
    borderColor: "#202020",
    borderStyle: "solid",
  },
  map: {
    flex: 1,
  },
});