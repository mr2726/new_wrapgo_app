import React from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppState, StyleSheet, Text, View } from "react-native";
import MapView from "react-native-maps/lib/MapView";
import { MapMarker as Marker } from "react-native-maps/lib/MapMarker";
import { MapPolyline as Polyline } from "react-native-maps/lib/MapPolyline";
import { PROVIDER_GOOGLE } from "react-native-maps/lib/ProviderConstants";

import { Selector_ } from "./selectors";

const ROUTE_COLOR = "#39ff14";

const FALLBACK_COORDINATE = {
  latitude: 40.18639151967678,
  longitude: 44.50473296150677,
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

const buildServiceCoordinate = (service) => {
  if (!service) {
    return null;
  }

  if (Array.isArray(service) && service.length >= 2) {
    return buildCoordinate(service[0], service[1]);
  }

  const latitude =
    service.latitude ??
    service.lat ??
    service.service_lat ??
    service.serviceLatitude;

  const longitude =
    service.longitude ??
    service.lng ??
    service.lon ??
    service.lan ??
    service.service_lng ??
    service.service_lon ??
    service.serviceLongitude;

  if (latitude == null || longitude == null) {
    const coordinates = service?.coordinates ?? service?.coords;

    if (Array.isArray(coordinates) && coordinates.length >= 2) {
      return buildCoordinate(coordinates[0], coordinates[1]);
    }
  }

  return buildCoordinate(latitude, longitude);
};

const normalizeServiceOptions = (services) => {
  const safeServices = Array.isArray(services)
    ? services
    : Array.isArray(services?.data)
      ? services.data
      : services
        ? [services]
        : [];

  return safeServices
    .map((service, index) => {
      const coordinate = buildServiceCoordinate(service);

      if (!coordinate) {
        return null;
      }

      const value =
        service?.id ??
        service?.service_id ??
        service?.name ??
        service?.title ??
        String(index);

      const label =
        service?.name ??
        service?.title ??
        service?.city ??
        `Service ${index + 1}`;

      return {
        value: String(value),
        label: String(label),
        coordinate,
        raw: service,
      };
    })
    .filter(Boolean);
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

const buildRouteRequestUrl = (fromCoordinate, toCoordinate) => {
  const from = `${fromCoordinate.longitude},${fromCoordinate.latitude}`;
  const to = `${toCoordinate.longitude},${toCoordinate.latitude}`;

  return `https://router.project-osrm.org/route/v1/driving/${from};${to}?overview=full&geometries=geojson`;
};

const fetchRouteCoordinates = async (fromCoordinate, toCoordinate, signal) => {
  const response = await fetch(
    buildRouteRequestUrl(fromCoordinate, toCoordinate),
    {
      method: "GET",
      signal,
    }
  );

  if (!response.ok) {
    throw new Error(`Route request failed with status ${response.status}`);
  }

  const payload = await response.json();
  const geometry = payload?.routes?.[0]?.geometry?.coordinates;

  if (!Array.isArray(geometry) || geometry.length === 0) {
    return [];
  }

  return geometry
    .map((pair) => {
      if (!Array.isArray(pair) || pair.length < 2) {
        return null;
      }

      const longitude = Number(pair[0]);
      const latitude = Number(pair[1]);

      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        return null;
      }

      return {
        latitude,
        longitude,
      };
    })
    .filter(Boolean);
};

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
      <View
        style={{
          position: "absolute",
          width: 30,
          height: 30,
          borderRadius: 15,
          backgroundColor: "rgba(0,255,90,0.25)",
        }}
      />

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

function ServiceMarker() {
  return (
    <View
      collapsable={false}
      style={{
        width: 26,
        height: 26,
        borderRadius: 13,
        backgroundColor: "#111",
        borderWidth: 3,
        borderColor: ROUTE_COLOR,
      }}
    />
  );
}

export default function ServiceRouteMap({
  coordinate,
  services,
  selectedServiceValue,
  onServiceChange,
}) {
  const mapRef = React.useRef(null);
  const [userCoordinate, setUserCoordinate] = React.useState(
    buildCoordinate(coordinate?.latitude, coordinate?.longitude) ||
      FALLBACK_COORDINATE
  );
  const [routeCoordinates, setRouteCoordinates] = React.useState([]);

  const serviceOptions = React.useMemo(
    () => normalizeServiceOptions(services),
    [services]
  );

  const [selectedServiceOption, setSelectedServiceOption] = React.useState(() => {
    if (selectedServiceValue) {
      return (
        serviceOptions.find((option) => option.value === String(selectedServiceValue)) ||
        serviceOptions[0] ||
        null
      );
    }

    return serviceOptions[0] || null;
  });

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
    if (serviceOptions.length === 0) {
      setSelectedServiceOption(null);
      return;
    }

    if (selectedServiceValue != null) {
      const nextOption =
        serviceOptions.find(
          (option) => option.value === String(selectedServiceValue)
        ) || serviceOptions[0];

      setSelectedServiceOption(nextOption);
      return;
    }

    setSelectedServiceOption((currentOption) => {
      if (!currentOption) {
        return serviceOptions[0];
      }

      const matchedOption = serviceOptions.find(
        (option) => option.value === currentOption.value
      );

      return matchedOption || serviceOptions[0];
    });
  }, [serviceOptions, selectedServiceValue]);

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
    let isMounted = true;
    const abortController = new AbortController();

    const selectedServiceCoordinate = selectedServiceOption?.coordinate;

    if (!selectedServiceCoordinate) {
      setRouteCoordinates([]);
      return () => {
        isMounted = false;
        abortController.abort();
      };
    }

    const loadRoute = async () => {
      try {
        const route = await fetchRouteCoordinates(
          userCoordinate,
          selectedServiceCoordinate,
          abortController.signal
        );

        if (!isMounted) {
          return;
        }

        if (route.length > 0) {
          setRouteCoordinates(route);
        } else {
          setRouteCoordinates([userCoordinate, selectedServiceCoordinate]);
        }
      } catch (error) {
        if (abortController.signal.aborted || !isMounted) {
          return;
        }

        console.warn("Failed to build route:", error);
        setRouteCoordinates([userCoordinate, selectedServiceCoordinate]);
      }
    };

    loadRoute();

    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, [userCoordinate, selectedServiceOption]);

  React.useEffect(() => {
    if (!mapRef.current) {
      return;
    }

    const pointsToFit = [
      userCoordinate,
      selectedServiceOption?.coordinate,
      ...routeCoordinates,
    ].filter(Boolean);

    if (pointsToFit.length < 2) {
      mapRef.current.animateToRegion(
        {
          latitude: userCoordinate.latitude,
          longitude: userCoordinate.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        },
        500
      );

      return;
    }

    mapRef.current.fitToCoordinates(pointsToFit, {
      edgePadding: {
        top: 50,
        right: 50,
        bottom: 50,
        left: 50,
      },
      animated: true,
    });
  }, [userCoordinate, selectedServiceOption, routeCoordinates]);

  const handleServiceChange = React.useCallback(
    (nextOption) => {
      setSelectedServiceOption(nextOption);

      if (typeof onServiceChange === "function") {
        onServiceChange(nextOption?.raw || null);
      }
    },
    [onServiceChange]
  );

  return (
    <View style={styles.wrapper}>
      <Selector_
        label="Select service"
        options={serviceOptions}
        value={selectedServiceOption}
        onValueChange={handleServiceChange}
      />

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

          {selectedServiceOption?.coordinate ? (
            <Marker
              coordinate={selectedServiceOption.coordinate}
              anchor={{ x: 0.5, y: 0.5 }}
              tracksViewChanges={true}
              title={selectedServiceOption.label}
            >
              <ServiceMarker />
            </Marker>
          ) : null}

          {routeCoordinates.length >= 2 ? (
            <Polyline
              coordinates={routeCoordinates}
              strokeColor={ROUTE_COLOR}
              strokeWidth={5}
            />
          ) : null}
        </MapView>

        {serviceOptions.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              Add service coordinates to show route.
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 16,
    gap: 10,
  },
  container: {
    height: 240,
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
  emptyState: {
    position: "absolute",
    left: 10,
    right: 10,
    bottom: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  emptyStateText: {
    color: "#d0d0d0",
    fontSize: 12,
  },
});
