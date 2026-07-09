import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

import { ChargerBottomSheet } from '@/components/ChargerBottomSheet';
import { LoadingState } from '@/components/LoadingState';
import { ChargeHubMapHandle, MapView } from '@/components/MapView';
import { MyLocationButton } from '@/components/MyLocationButton';
import { SearchBar } from '@/components/SearchBar';
import { useCurrentLocation } from '@/hooks/useCurrentLocation';
import { searchMapRegionDelta, useMapRegion } from '@/hooks/useMapRegion';
import { useNearbyChargers } from '@/hooks/useNearbyChargers';
import { Charger } from '@/services/chargers';
import { geocodePlace } from '@/services/geocoding';
import { locationPermissionStatus } from '@/services/location';

export function HomeScreen() {
  const mapRef = useRef<ChargeHubMapHandle>(null);
  const [selectedCharger, setSelectedCharger] = useState<Charger | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const {
    errorMessage,
    isLoading,
    location,
    permissionStatus,
    retry,
    showRetry
  } = useCurrentLocation();
  const { handleRegionChangeComplete, queryCenter, visibleRegion } =
    useMapRegion(location);
  const {
    data: chargers = [],
    error: chargersError,
    isError: isChargersError,
    isFetching: isChargersFetching,
    isPending: isChargersPending
  } = useNearbyChargers(queryCenter);

  const isPermissionDenied =
    permissionStatus === locationPermissionStatus.DENIED;
  const showError = isPermissionDenied || errorMessage !== null;
  const showChargersEmpty =
    Boolean(queryCenter) &&
    !isChargersFetching &&
    !isChargersError &&
    chargers.length === 0;
  const isRefreshingChargers =
    isChargersFetching && !isChargersPending && chargers.length > 0;

  useEffect(() => {
    if (!selectedCharger || !visibleRegion) {
      return;
    }

    const isVisible =
      Math.abs(selectedCharger.latitude - visibleRegion.latitude) <=
        visibleRegion.latitudeDelta / 2 &&
      Math.abs(selectedCharger.longitude - visibleRegion.longitude) <=
        visibleRegion.longitudeDelta / 2;

    if (!isVisible) {
      setSelectedCharger(null);
    }
  }, [selectedCharger, visibleRegion]);

  const handleSearch = async (query: string) => {
    setSelectedCharger(null);
    setSearchError(null);
    setIsSearching(true);

    try {
      const coordinates = await geocodePlace(query);

      if (!coordinates) {
        setSearchError('Place not found. Try a more specific search.');
        return;
      }

      if (coordinates.isBroad) {
        setSearchError(
          'That result is too broad. Add a city, area, or street and try again.'
        );
        return;
      }

      mapRef.current?.moveToCoordinates(coordinates, searchMapRegionDelta);
    } catch {
      setSearchError('Unable to search right now. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <View className="flex-1 bg-white">
      <MapView
        ref={mapRef}
        chargers={chargers}
        location={location}
        onChargerPress={setSelectedCharger}
        onRegionChangeComplete={handleRegionChangeComplete}
      />
      {isLoading ? <LoadingState message="Finding your location..." /> : null}
      {showError ? (
        <View
          className="absolute inset-x-5 top-48 rounded-md bg-white px-4 py-4 shadow"
          pointerEvents="none"
        >
          <Text className="text-base font-semibold text-neutral-950">
            Location needed
          </Text>
          <Text className="mt-1 text-sm text-neutral-600">
            Allow location access so ChargeHub can center the map around you.
          </Text>
        </View>
      ) : null}
      {isChargersPending ? (
        <View
          className="absolute inset-x-5 top-48 rounded-md bg-white px-4 py-3 shadow"
          pointerEvents="none"
        >
          <Text className="text-sm text-neutral-700">
            Loading nearby chargers...
          </Text>
        </View>
      ) : null}
      {isRefreshingChargers ? (
        <View
          className="absolute right-5 top-48 h-10 w-10 items-center justify-center rounded-full bg-white shadow"
          pointerEvents="none"
        >
          <ActivityIndicator size="small" />
        </View>
      ) : null}
      {showChargersEmpty ? (
        <View
          className="absolute inset-x-5 top-48 rounded-md bg-white px-4 py-3 shadow"
          pointerEvents="none"
        >
          <Text className="text-sm text-neutral-700">
            No nearby chargers found yet.
          </Text>
        </View>
      ) : null}
      {isChargersError ? (
        <View
          className="absolute inset-x-5 top-48 rounded-md bg-white px-4 py-4 shadow"
          pointerEvents="none"
        >
          <Text className="text-base font-semibold text-neutral-950">
            Chargers unavailable
          </Text>
          <Text className="mt-1 text-sm text-neutral-600">
            {chargersError instanceof Error
              ? chargersError.message
              : 'Unable to load nearby chargers.'}
          </Text>
        </View>
      ) : null}
      {showRetry ? (
        <View className="absolute bottom-28 right-5" pointerEvents="none">
          <Text className="overflow-hidden rounded-md bg-white px-3 py-2 text-sm text-neutral-700 shadow">
            Tap My Location to try again.
          </Text>
        </View>
      ) : null}
      <SearchBar
        errorMessage={searchError}
        isLoading={isSearching}
        onSubmit={(query) => void handleSearch(query)}
      />
      <MyLocationButton
        disabled={isLoading}
        onPress={() => {
          if (showRetry) {
            void retry();
            return;
          }

          mapRef.current?.recenter();
        }}
      />
      {selectedCharger ? (
        <ChargerBottomSheet
          charger={selectedCharger}
          onClose={() => setSelectedCharger(null)}
        />
      ) : null}
    </View>
  );
}
