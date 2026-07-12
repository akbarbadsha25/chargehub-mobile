import AsyncStorage from '@react-native-async-storage/async-storage';

import { Charger, ChargerMediaItem } from '@/services/chargers';

const favoritesStorageKey = 'chargehub:favorites';

type FavoritesListener = (favorites: Charger[]) => void;

const listeners = new Set<FavoritesListener>();

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function normalizeMedia(value: unknown): ChargerMediaItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    if (
      !isRecord(item) ||
      typeof item.id !== 'string' ||
      typeof item.url !== 'string'
    ) {
      return [];
    }

    return [
      {
        attribution:
          typeof item.attribution === 'string' ? item.attribution : null,
        id: item.id,
        thumbnailUrl:
          typeof item.thumbnailUrl === 'string' ? item.thumbnailUrl : null,
        url: item.url
      }
    ];
  });
}

function normalizeFavorite(value: unknown): Charger | null {
  if (!isRecord(value)) {
    return null;
  }

  const { id, latitude, longitude, name } = value;

  if (
    typeof id !== 'string' ||
    typeof latitude !== 'number' ||
    typeof longitude !== 'number' ||
    typeof name !== 'string'
  ) {
    return null;
  }

  return {
    address: typeof value.address === 'string' ? value.address : null,
    connectorType:
      typeof value.connectorType === 'string' ? value.connectorType : null,
    connectorTypes: Array.isArray(value.connectorTypes)
      ? value.connectorTypes.filter(
          (connector): connector is string => typeof connector === 'string'
        )
      : [],
    distanceKm: typeof value.distanceKm === 'number' ? value.distanceKm : null,
    id,
    latitude,
    longitude,
    maxPowerKw: typeof value.maxPowerKw === 'number' ? value.maxPowerKw : null,
    media: normalizeMedia(value.media),
    name,
    powerKw: typeof value.powerKw === 'number' ? value.powerKw : null,
    provider: typeof value.provider === 'string' ? value.provider : null,
    status:
      value.status === 'available' ||
      value.status === 'limited' ||
      value.status === 'offline' ||
      value.status === 'unknown'
        ? value.status
        : 'unknown'
  };
}

function notifyFavorites(favorites: Charger[]) {
  listeners.forEach((listener) => listener(favorites));
}

async function writeFavorites(favorites: Charger[]) {
  await AsyncStorage.setItem(favoritesStorageKey, JSON.stringify(favorites));
  notifyFavorites(favorites);
}

export function subscribeFavorites(listener: FavoritesListener) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

export async function getFavoriteChargers(): Promise<Charger[]> {
  const rawFavorites = await AsyncStorage.getItem(favoritesStorageKey);

  if (!rawFavorites) {
    return [];
  }

  try {
    const parsedFavorites = JSON.parse(rawFavorites) as unknown;

    if (!Array.isArray(parsedFavorites)) {
      return [];
    }

    return parsedFavorites.flatMap((favorite) => {
      const normalizedFavorite = normalizeFavorite(favorite);
      return normalizedFavorite ? [normalizedFavorite] : [];
    });
  } catch {
    return [];
  }
}

export async function saveFavoriteCharger(charger: Charger) {
  const favorites = await getFavoriteChargers();
  const nextFavorites = [
    charger,
    ...favorites.filter((favorite) => favorite.id !== charger.id)
  ];

  await writeFavorites(nextFavorites);
}

export async function removeFavoriteCharger(chargerId: string) {
  const favorites = await getFavoriteChargers();
  const nextFavorites = favorites.filter(
    (favorite) => favorite.id !== chargerId
  );

  await writeFavorites(nextFavorites);
}
