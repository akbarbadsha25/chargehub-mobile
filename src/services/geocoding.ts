import * as Location from 'expo-location';

import { Coordinates } from '@/services/location';

export async function geocodePlace(query: string): Promise<Coordinates | null> {
  const results = await Location.geocodeAsync(query);
  const result = results[0];

  if (!result) {
    return null;
  }

  return {
    latitude: result.latitude,
    longitude: result.longitude
  };
}
