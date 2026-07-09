import * as Location from 'expo-location';

import { Coordinates } from '@/services/location';

export type GeocodingResult = Coordinates & {
  isBroad: boolean;
  label: string;
};

type GeocodedLocation = Awaited<
  ReturnType<typeof Location.geocodeAsync>
>[number];
type GeocodedAddress = Awaited<
  ReturnType<typeof Location.reverseGeocodeAsync>
>[number];

type GeocodingCandidate = GeocodedLocation & {
  address: GeocodedAddress | null;
  isBroad: boolean;
  label: string;
  score: number;
};

function normalizeQuery(query: string): string {
  return query.trim().replace(/\s+/g, ' ');
}

function getQueryVariants(query: string): string[] {
  const normalizedQuery = normalizeQuery(query);
  const words = normalizedQuery.split(' ');

  if (normalizedQuery.includes(',') || words.length < 3) {
    return [normalizedQuery];
  }

  return [normalizedQuery, `${words.slice(0, -1).join(' ')}, ${words.at(-1)}`];
}

function getSearchTokens(query: string): string[] {
  return query
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length > 1);
}

function getAddressLabel(address: GeocodedAddress | null): string {
  if (!address) {
    return 'Unknown place';
  }

  return [
    address.name,
    address.street,
    address.district,
    address.city,
    address.region,
    address.country
  ]
    .filter((part, index, parts): part is string => {
      return Boolean(part) && parts.indexOf(part) === index;
    })
    .join(', ');
}

function scoreCandidate(
  result: GeocodedLocation,
  address: GeocodedAddress | null,
  searchTokens: string[]
): GeocodingCandidate {
  const label = getAddressLabel(address);
  const normalizedLabel = label.toLowerCase();
  const matchedTokenCount = searchTokens.filter((token) =>
    normalizedLabel.includes(token)
  ).length;
  const matchRatio =
    searchTokens.length > 0 ? matchedTokenCount / searchTokens.length : 0;
  const addressDetailScore =
    Number(Boolean(address?.name)) * 4 +
    Number(Boolean(address?.street)) * 3 +
    Number(Boolean(address?.district)) * 2 +
    Number(Boolean(address?.postalCode));
  const accuracy = result.accuracy ?? Number.POSITIVE_INFINITY;
  const accuracyScore =
    accuracy <= 200 ? 6 : accuracy <= 1000 ? 4 : accuracy <= 5000 ? 2 : 0;
  const hasAddressDetail = Boolean(
    address?.street || address?.district || address?.postalCode
  );
  const isBroad =
    accuracy > 50000 ||
    (searchTokens.length > 1 &&
      matchRatio < 0.5 &&
      !hasAddressDetail &&
      accuracy > 1000);

  return {
    ...result,
    address,
    isBroad,
    label,
    score: matchedTokenCount * 10 + addressDetailScore + accuracyScore
  };
}

async function getAddress(
  result: GeocodedLocation
): Promise<GeocodedAddress | null> {
  try {
    const addresses = await Location.reverseGeocodeAsync({
      latitude: result.latitude,
      longitude: result.longitude
    });

    return addresses[0] ?? null;
  } catch {
    return null;
  }
}

export async function geocodePlace(
  query: string
): Promise<GeocodingResult | null> {
  const variants = getQueryVariants(query);
  const locationResults: GeocodedLocation[] = [];
  let lastError: unknown;

  for (const variant of variants) {
    try {
      locationResults.push(...(await Location.geocodeAsync(variant)));
    } catch (error) {
      lastError = error;
    }
  }

  if (locationResults.length === 0 && lastError) {
    throw lastError;
  }

  const uniqueResults = locationResults
    .filter((result, index, results) => {
      const key = `${result.latitude.toFixed(5)},${result.longitude.toFixed(5)}`;

      return (
        results.findIndex(
          (candidate) =>
            `${candidate.latitude.toFixed(5)},${candidate.longitude.toFixed(
              5
            )}` === key
        ) === index
      );
    })
    .slice(0, 5);
  const searchTokens = getSearchTokens(query);
  const candidates: GeocodingCandidate[] = [];

  for (const result of uniqueResults) {
    const address = await getAddress(result);
    candidates.push(scoreCandidate(result, address, searchTokens));
  }

  candidates.sort((first, second) => second.score - first.score);

  if (__DEV__) {
    console.log('[Geocoding] results', {
      query,
      results: candidates.map((candidate) => ({
        accuracy: candidate.accuracy ?? null,
        isBroad: candidate.isBroad,
        label: candidate.label,
        latitude: candidate.latitude,
        longitude: candidate.longitude,
        score: candidate.score
      })),
      variants
    });
  }

  const bestResult = candidates[0];

  if (!bestResult) {
    return null;
  }

  return {
    isBroad: bestResult.isBroad,
    label: bestResult.label,
    latitude: bestResult.latitude,
    longitude: bestResult.longitude
  };
}
