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
import { CurrentLocation } from '@/services/location';

export type ChargeHubMapHandle = {
  recenter: () => void;
};

type ChargeHubMapProps = {
  chargers: Charger[];
  location: CurrentLocation | null;
  onChargerPress: (charger: Charger) => void;
  onRegionChangeComplete: (region: Region) => void;
};

function getRegion(location: CurrentLocation): Region {
  return {
    latitude: location.latitude,
    latitudeDelta: defaultMapRegionDelta,
    longitude: location.longitude,
    longitudeDelta: defaultMapRegionDelta
  };
}

export const MapView = forwardRef<ChargeHubMapHandle, ChargeHubMapProps>(
  function MapView(
    { chargers, location, onChargerPress, onRegionChangeComplete },
    ref
  ) {
    const mapRef = useRef<RNMapView>(null);

    const recenter = useCallback(() => {
      if (!location) {
        return;
      }

      mapRef.current?.animateToRegion(getRegion(location), 500);
    }, [location]);

    useImperativeHandle(ref, () => ({ recenter }), [recenter]);

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
