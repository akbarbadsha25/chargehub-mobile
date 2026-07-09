import * as Location from 'expo-location';

export type LocationPermissionStatus = Location.PermissionStatus | 'unknown';

export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type CurrentLocation = Coordinates & {
  accuracy: number | null;
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
