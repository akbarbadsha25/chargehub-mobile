import { Coordinates } from '@/services/location';

const openChargeMapBaseUrl = 'https://api.openchargemap.io/v3/poi/';
const nearbyRadiusKm = 5;
const maxResults = 50;

type OpenChargeMapAddressInfo = {
  AddressLine1?: string;
  Distance?: number;
  Latitude?: number;
  Longitude?: number;
  Postcode?: string;
  StateOrProvince?: string;
  Title?: string;
  Town?: string;
};

type OpenChargeMapConnection = {
  ConnectionType?: {
    Title?: string;
  };
  PowerKW?: number;
};

type OpenChargeMapOperatorInfo = {
  Title?: string;
};

type OpenChargeMapPoi = {
  AddressInfo?: OpenChargeMapAddressInfo;
  Connections?: OpenChargeMapConnection[];
  ID: number;
  OperatorInfo?: OpenChargeMapOperatorInfo;
};

export type Charger = {
  address: string | null;
  connectorType: string | null;
  connectorTypes: string[];
  distanceKm: number | null;
  id: string;
  latitude: number;
  longitude: number;
  maxPowerKw: number | null;
  name: string;
  powerKw: number | null;
  provider: string | null;
};

function normalizeAddress(
  addressInfo?: OpenChargeMapAddressInfo
): string | null {
  const address = [
    addressInfo?.AddressLine1,
    addressInfo?.Town,
    addressInfo?.StateOrProvince,
    addressInfo?.Postcode
  ]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(', ');

  return address || null;
}

function normalizeCharger(poi: OpenChargeMapPoi): Charger | null {
  const latitude = poi.AddressInfo?.Latitude;
  const longitude = poi.AddressInfo?.Longitude;
  const connections = poi.Connections ?? [];
  const connection = connections.find(
    (item) => item.ConnectionType?.Title || typeof item.PowerKW === 'number'
  );
  const connectorTypes = [
    ...new Set(
      connections
        .map((item) => item.ConnectionType?.Title?.trim())
        .filter((title): title is string => Boolean(title))
    )
  ];
  const powerValues = connections
    .map((item) => item.PowerKW)
    .filter((power): power is number => typeof power === 'number');

  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    return null;
  }

  return {
    address: normalizeAddress(poi.AddressInfo),
    connectorType: connection?.ConnectionType?.Title?.trim() || null,
    connectorTypes,
    distanceKm:
      typeof poi.AddressInfo?.Distance === 'number'
        ? poi.AddressInfo.Distance
        : null,
    id: String(poi.ID),
    latitude,
    longitude,
    maxPowerKw: powerValues.length > 0 ? Math.max(...powerValues) : null,
    name: poi.AddressInfo?.Title?.trim() || 'Unnamed charger',
    powerKw:
      typeof connection?.PowerKW === 'number' ? connection.PowerKW : null,
    provider: poi.OperatorInfo?.Title?.trim() || null
  };
}

export async function getNearbyChargers(
  location: Coordinates
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
