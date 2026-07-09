import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef
} from 'react';
import { StyleSheet } from 'react-native';
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

export const MapView = forwardRef<ChargeHubMapHandle, ChargeHubMapProps>(
  function MapView(
    { chargers, location, onChargerPress, onRegionChangeComplete },
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
        onRegionChangeComplete={onRegionChangeComplete}
        pitchEnabled
        rotateEnabled
        scrollEnabled
        showsUserLocation
        style={styles.map}
        zoomEnabled
      >
        {chargers.map((charger) => (
          <Marker
            key={charger.id}
            coordinate={{
              latitude: charger.latitude,
              longitude: charger.longitude
            }}
            onPress={() => onChargerPress(charger)}
          />
        ))}
      </RNMapView>
    );
  }
);

const styles = StyleSheet.create({
  map: {
    ...StyleSheet.absoluteFillObject
  }
});
