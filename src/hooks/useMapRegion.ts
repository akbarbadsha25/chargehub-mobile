import { useCallback, useEffect, useRef, useState } from 'react';
import { Region } from 'react-native-maps';

import { Coordinates } from '@/services/location';

export const defaultMapRegionDelta = 0.045;
export const searchMapRegionDelta = 0.025;

function createRegion(center: Coordinates): Region {
  return {
    latitude: center.latitude,
    latitudeDelta: defaultMapRegionDelta,
    longitude: center.longitude,
    longitudeDelta: defaultMapRegionDelta
  };
}

export function useMapRegion(initialCenter: Coordinates | null) {
  const [visibleRegion, setVisibleRegion] = useState<Region | null>(
    initialCenter ? createRegion(initialCenter) : null
  );
  const [queryCenter, setQueryCenter] = useState<Coordinates | null>(
    initialCenter
  );
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!initialCenter) {
      return;
    }

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    setVisibleRegion(createRegion(initialCenter));
    setQueryCenter(initialCenter);
  }, [initialCenter]);

  useEffect(
    () => () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    },
    []
  );

  const handleRegionChangeComplete = useCallback((region: Region) => {
    setVisibleRegion(region);

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      setQueryCenter({
        latitude: region.latitude,
        longitude: region.longitude
      });
    }, 500);
  }, []);

  return {
    handleRegionChangeComplete,
    queryCenter,
    visibleRegion
  };
}
