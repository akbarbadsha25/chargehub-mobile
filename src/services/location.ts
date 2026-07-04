import * as Location from 'expo-location';

export type LocationPermissionStatus = Location.PermissionStatus | 'unknown';

export type CurrentLocation = {
  accuracy: number | null;
  latitude: number;
  longitude: number;
};

export async function requestLocationPermission() {
  return Location.requestForegroundPermissionsAsync();
}

export async function getCurrentLocation(): Promise<CurrentLocation> {
  const currentLocation = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced
  });

  return {
    accuracy: currentLocation.coords.accuracy,
    latitude: currentLocation.coords.latitude,
    longitude: currentLocation.coords.longitude
  };
}

export const locationPermissionStatus = Location.PermissionStatus;
