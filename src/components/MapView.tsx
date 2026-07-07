import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef
} from 'react';
import { StyleSheet } from 'react-native';
import RNMapView, { Region } from 'react-native-maps';

import { CurrentLocation } from '@/services/location';

const latitudeDelta = 0.012;
const longitudeDelta = 0.012;

export type ChargeHubMapHandle = {
  recenter: () => void;
};

type ChargeHubMapProps = {
  location: CurrentLocation | null;
};

function getRegion(location: CurrentLocation): Region {
  return {
    latitude: location.latitude,
    latitudeDelta,
    longitude: location.longitude,
    longitudeDelta
  };
}

export const MapView = forwardRef<ChargeHubMapHandle, ChargeHubMapProps>(
  function MapView({ location }, ref) {
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
        showsUserLocation
        style={styles.map}
      />
    );
  }
);

const styles = StyleSheet.create({
  map: {
    ...StyleSheet.absoluteFillObject
  }
});
