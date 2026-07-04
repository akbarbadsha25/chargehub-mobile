import { useCallback, useEffect, useRef, useState } from 'react';
import * as Location from 'expo-location';
import { Pressable, Text, View } from 'react-native';

type LocationStatus = Location.PermissionStatus | 'unknown';

type CurrentLocation = {
  accuracy: number | null;
  latitude: number;
  longitude: number;
};

export function HomeScreen() {
  const hasRequestedLocation = useRef(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [location, setLocation] = useState<CurrentLocation | null>(null);
  const [permissionStatus, setPermissionStatus] =
    useState<LocationStatus>('unknown');

  const loadCurrentLocation = useCallback(async () => {
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      setPermissionStatus(permission.status);

      if (permission.status !== Location.PermissionStatus.GRANTED) {
        setLocation(null);
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced
      });

      setLocation({
        accuracy: currentLocation.coords.accuracy,
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude
      });
    } catch {
      setLocation(null);
      setErrorMessage('Unable to get your current location.');
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

  const showRetry =
    permissionStatus === Location.PermissionStatus.DENIED ||
    errorMessage !== null;

  return (
    <View className="flex-1 justify-center bg-white px-6">
      <Text className="text-center text-xl font-semibold text-neutral-950">
        ChargeHub MVP
      </Text>
      <View className="mt-6 gap-3">
        <Text className="text-base text-neutral-700">
          Permission status: {permissionStatus}
        </Text>
        <Text className="text-base text-neutral-700">
          Latitude: {location?.latitude ?? 'Unavailable'}
        </Text>
        <Text className="text-base text-neutral-700">
          Longitude: {location?.longitude ?? 'Unavailable'}
        </Text>
        <Text className="text-base text-neutral-700">
          Accuracy: {location?.accuracy ?? 'Unavailable'}
        </Text>
        {isLoading ? (
          <Text className="text-base text-neutral-700">
            Loading location...
          </Text>
        ) : null}
        {errorMessage ? (
          <Text className="text-base text-red-600">{errorMessage}</Text>
        ) : null}
      </View>
      {showRetry ? (
        <Pressable
          className="mt-6 items-center rounded-md bg-neutral-950 px-4 py-3"
          onPress={loadCurrentLocation}
        >
          <Text className="font-semibold text-white">Retry Location</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
