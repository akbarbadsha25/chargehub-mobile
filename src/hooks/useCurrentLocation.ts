import { useCallback, useEffect, useRef, useState } from 'react';

import {
  CurrentLocation,
  LocationPermissionStatus,
  getCurrentLocation,
  locationPermissionStatus,
  requestLocationPermission
} from '@/services/location';

type CurrentLocationState = {
  errorMessage: string | null;
  isLoading: boolean;
  location: CurrentLocation | null;
  permissionStatus: LocationPermissionStatus;
  retry: () => Promise<void>;
  showRetry: boolean;
};

export function useCurrentLocation(): CurrentLocationState {
  const hasRequestedLocation = useRef(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [location, setLocation] = useState<CurrentLocation | null>(null);
  const [permissionStatus, setPermissionStatus] =
    useState<LocationPermissionStatus>('unknown');

  const loadCurrentLocation = useCallback(async () => {
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const permission = await requestLocationPermission();
      setPermissionStatus(permission.status);

      if (permission.status !== locationPermissionStatus.GRANTED) {
        setLocation(null);
        return;
      }

      setLocation(await getCurrentLocation());
    } catch {
      setLocation(null);
      setErrorMessage('We could not get your current location.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (hasRequestedLocation.current) {
      return;
    }

    hasRequestedLocation.current = true;
    void loadCurrentLocation();
  }, [loadCurrentLocation]);

  return {
    errorMessage,
    isLoading,
    location,
    permissionStatus,
    retry: loadCurrentLocation,
    showRetry:
      permissionStatus === locationPermissionStatus.DENIED ||
      errorMessage !== null
  };
}
