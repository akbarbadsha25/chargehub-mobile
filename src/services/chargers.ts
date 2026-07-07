import { CurrentLocation } from '@/services/location';

const openChargeMapBaseUrl = 'https://api.openchargemap.io/v3/poi/';
const nearbyRadiusKm = 5;
const maxResults = 50;

type OpenChargeMapAddressInfo = {
  Latitude?: number;
  Longitude?: number;
  Title?: string;
};

type OpenChargeMapOperatorInfo = {
  Title?: string;
};

type OpenChargeMapPoi = {
  AddressInfo?: OpenChargeMapAddressInfo;
  ID: number;
  OperatorInfo?: OpenChargeMapOperatorInfo;
};

export type Charger = {
  id: string;
  latitude: number;
  longitude: number;
  name: string;
  provider: string | null;
};

function normalizeCharger(poi: OpenChargeMapPoi): Charger | null {
  const latitude = poi.AddressInfo?.Latitude;
  const longitude = poi.AddressInfo?.Longitude;

  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    return null;
  }

  return {
    id: String(poi.ID),
    latitude,
    longitude,
    name: poi.AddressInfo?.Title?.trim() || 'Unnamed charger',
    provider: poi.OperatorInfo?.Title?.trim() || null
  };
}

export async function getNearbyChargers(
  location: CurrentLocation
): Promise<Charger[]> {
  const apiKey = process.env.EXPO_PUBLIC_OPENCHARGEMAP_API_KEY;

  if (!apiKey) {
    throw new Error('OpenChargeMap API key is missing.');
  }

  const url = new URL(openChargeMapBaseUrl);
  url.searchParams.set('output', 'json');
  url.searchParams.set('latitude', String(location.latitude));
  url.searchParams.set('longitude', String(location.longitude));
  url.searchParams.set('distance', String(nearbyRadiusKm));
  url.searchParams.set('distanceunit', 'KM');
  url.searchParams.set('maxresults', String(maxResults));
  url.searchParams.set('compact', 'false');
  url.searchParams.set('verbose', 'false');
  url.searchParams.set('key', apiKey);

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error('Unable to load nearby chargers.');
  }

  const data = (await response.json()) as OpenChargeMapPoi[];

  return data.flatMap((poi) => {
    const charger = normalizeCharger(poi);
    return charger ? [charger] : [];
  });
}
