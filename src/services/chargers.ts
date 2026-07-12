import { Coordinates } from '@/services/location';

const openChargeMapBaseUrl = 'https://api.openchargemap.io/v3/poi/';
const nearbyRadiusKm = 5;
const maxResults = 50;

type OpenChargeMapAddressInfo = {
  AddressLine1?: string;
  AddressLine2?: string;
  Country?: {
    Title?: string;
  };
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

type OpenChargeMapMediaItem = {
  Attribution?: string;
  Comment?: string;
  ID?: number;
  IsEnabled?: boolean;
  IsExternalResource?: boolean;
  ItemThumbnailURL?: string;
  ItemURL?: string;
};

type OpenChargeMapPoi = {
  AddressInfo?: OpenChargeMapAddressInfo;
  Connections?: OpenChargeMapConnection[];
  ID: number;
  MediaItems?: OpenChargeMapMediaItem[];
  OperatorInfo?: OpenChargeMapOperatorInfo;
  StatusType?: {
    IsOperational?: boolean;
    Title?: string;
  };
};

export type ChargerStatus = 'available' | 'limited' | 'offline' | 'unknown';

export type ChargerMediaItem = {
  attribution: string | null;
  id: string;
  thumbnailUrl: string | null;
  url: string;
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
  media: ChargerMediaItem[];
  name: string;
  powerKw: number | null;
  provider: string | null;
  status: ChargerStatus;
};

function normalizeAddress(
  addressInfo?: OpenChargeMapAddressInfo
): string | null {
  const address = [
    addressInfo?.AddressLine1,
    addressInfo?.AddressLine2,
    addressInfo?.Town,
    addressInfo?.StateOrProvince,
    addressInfo?.Postcode,
    addressInfo?.Country?.Title
  ]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(', ');

  return address || null;
}

function isValidImageUrl(url?: string): url is string {
  if (!url) {
    return false;
  }

  try {
    const parsedUrl = new URL(url);
    const pathname = parsedUrl.pathname.toLowerCase();
    const hasImageExtension = /\.(avif|gif|jpe?g|png|webp)$/.test(pathname);

    return (
      (parsedUrl.protocol === 'https:' || parsedUrl.protocol === 'http:') &&
      hasImageExtension
    );
  } catch {
    return false;
  }
}

function normalizeMediaItems(
  mediaItems?: OpenChargeMapMediaItem[]
): ChargerMediaItem[] {
  if (!mediaItems) {
    return [];
  }

  return mediaItems.flatMap((item, index) => {
    if (item.IsEnabled === false || !isValidImageUrl(item.ItemURL)) {
      return [];
    }

    return [
      {
        attribution: item.Attribution?.trim() || item.Comment?.trim() || null,
        id: item.ID ? String(item.ID) : `${item.ItemURL}-${index}`,
        thumbnailUrl: isValidImageUrl(item.ItemThumbnailURL)
          ? item.ItemThumbnailURL
          : null,
        url: item.ItemURL
      }
    ];
  });
}

function normalizeStatus(statusType?: OpenChargeMapPoi['StatusType']) {
  const title = statusType?.Title?.trim().toLowerCase();

  if (statusType?.IsOperational === true && title === 'operational') {
    return 'available';
  }

  if (
    statusType?.IsOperational === false ||
    title?.includes('not operational') ||
    title?.includes('faulted')
  ) {
    return 'offline';
  }

  if (
    title?.includes('partly') ||
    title?.includes('limited') ||
    title?.includes('busy') ||
    title?.includes('temporarily unavailable')
  ) {
    return 'limited';
  }

  return 'unknown';
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
    media: normalizeMediaItems(poi.MediaItems),
    name: poi.AddressInfo?.Title?.trim() || 'Unnamed charger',
    powerKw:
      typeof connection?.PowerKW === 'number' ? connection.PowerKW : null,
    provider: poi.OperatorInfo?.Title?.trim() || null,
    status: normalizeStatus(poi.StatusType)
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
