import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef
} from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import RNMapView, { Marker, Region } from 'react-native-maps';

import { defaultMapRegionDelta } from '@/hooks/useMapRegion';
import { Charger } from '@/services/chargers';
import { Coordinates, CurrentLocation } from '@/services/location';

export type ChargeHubMapHandle = {
  moveToCoordinates: (coordinates: Coordinates, regionDelta?: number) => void;
  recenter: () => void;
};

type ChargeHubMapProps = {
  chargers: Charger[];
  location: CurrentLocation | null;
  onChargerPress: (charger: Charger) => void;
  onRegionChangeComplete: (region: Region) => void;
  selectedChargerId: string | null;
};

function getRegion(
  coordinates: Coordinates,
  regionDelta = defaultMapRegionDelta
): Region {
  return {
    latitude: coordinates.latitude,
    latitudeDelta: regionDelta,
    longitude: coordinates.longitude,
    longitudeDelta: regionDelta
  };
}

type ChargerMarkerProps = {
  charger: Charger;
  isSelected: boolean;
  onPress: (charger: Charger) => void;
};

function ChargerMarker({ charger, isSelected, onPress }: ChargerMarkerProps) {
  const scale = useRef(new Animated.Value(isSelected ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(scale, {
      damping: 14,
      mass: 0.8,
      stiffness: 180,
      toValue: isSelected ? 1 : 0,
      useNativeDriver: true
    }).start();
  }, [isSelected, scale]);

  const markerScale = scale.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.28]
  });

  return (
    <Marker
      accessibilityLabel={`Open ${charger.name} charger details`}
      coordinate={{
        latitude: charger.latitude,
        longitude: charger.longitude
      }}
      onPress={() => onPress(charger)}
      tracksViewChanges
    >
      <Animated.View
        style={[
          styles.marker,
          isSelected ? styles.selectedMarker : styles.defaultMarker,
          { transform: [{ scale: markerScale }] }
        ]}
      >
        <View style={styles.markerCore} />
      </Animated.View>
    </Marker>
  );
}

export const MapView = forwardRef<ChargeHubMapHandle, ChargeHubMapProps>(
  function MapView(
    {
      chargers,
      location,
      onChargerPress,
      onRegionChangeComplete,
      selectedChargerId
    },
    ref
  ) {
    const mapRef = useRef<RNMapView>(null);

    const moveToCoordinates = useCallback(
      (coordinates: Coordinates, regionDelta?: number) => {
        mapRef.current?.animateToRegion(
          getRegion(coordinates, regionDelta),
          500
        );
      },
      []
    );

    const recenter = useCallback(() => {
      if (!location) {
        return;
      }

      moveToCoordinates(location);
    }, [location, moveToCoordinates]);

    useImperativeHandle(ref, () => ({ moveToCoordinates, recenter }), [
      moveToCoordinates,
      recenter
    ]);

    useEffect(() => {
      recenter();
    }, [recenter]);

    return (
      <RNMapView
        ref={mapRef}
        initialRegion={location ? getRegion(location) : undefined}
        mapPadding={{
          bottom: selectedChargerId ? 340 : 88,
          left: 16,
          right: 16,
          top: 96
        }}
        onRegionChangeComplete={onRegionChangeComplete}
        pitchEnabled
        rotateEnabled
        scrollEnabled
        showsUserLocation
        style={styles.map}
        zoomEnabled
      >
        {chargers.map((charger) => (
          <ChargerMarker
            key={charger.id}
            charger={charger}
            isSelected={charger.id === selectedChargerId}
            onPress={onChargerPress}
          />
        ))}
      </RNMapView>
    );
  }
);

const styles = StyleSheet.create({
  map: {
    ...StyleSheet.absoluteFillObject
  },
  defaultMarker: {
    backgroundColor: '#171717'
  },
  marker: {
    alignItems: 'center',
    borderColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 2,
    height: 32,
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { height: 2, width: 0 },
    shadowOpacity: 0.22,
    shadowRadius: 3,
    width: 32
  },
  markerCore: {
    backgroundColor: '#ffffff',
    borderRadius: 5,
    height: 10,
    width: 10
  },
  selectedMarker: {
    backgroundColor: '#dc2626'
  }
});
