import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Keyboard, Text, View } from 'react-native';
import { Region } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ChargerBottomSheet } from '@/components/ChargerBottomSheet';
import { FilterChips } from '@/components/FilterChips';
import { LoadingState } from '@/components/LoadingState';
import { ChargeHubMapHandle, MapView } from '@/components/MapView';
import { MyLocationButton } from '@/components/MyLocationButton';
import { SearchBar } from '@/components/SearchBar';
import { useCurrentLocation } from '@/hooks/useCurrentLocation';
import { useFavorites } from '@/hooks/useFavorites';
import { searchMapRegionDelta, useMapRegion } from '@/hooks/useMapRegion';
import { useNearbyChargers } from '@/hooks/useNearbyChargers';
import { Charger } from '@/services/chargers';
import { geocodePlace } from '@/services/geocoding';
import { locationPermissionStatus } from '@/services/location';
import { useChargeHubDiagnosticsStore } from '@/store';
import { ChargerFilter, filterChargers } from '@/utils/filterChargers';

import type { MainTabParamList } from '@/navigation/RootNavigator';

type HomeScreenProps = BottomTabScreenProps<MainTabParamList, 'Home'>;

function isChargerVisible(charger: Charger, region: Region) {
  return (
    Math.abs(charger.latitude - region.latitude) <= region.latitudeDelta / 2 &&
    Math.abs(charger.longitude - region.longitude) <= region.longitudeDelta / 2
  );
}

function getSheetAwareCenter(charger: Charger, region: Region | null) {
  const latitudeDelta = region?.latitudeDelta ?? searchMapRegionDelta;

  return {
    latitude: charger.latitude - latitudeDelta * 0.18,
    longitude: charger.longitude
  };
}

export function HomeScreen({ navigation, route }: HomeScreenProps) {
  const insets = useSafeAreaInsets();
  const mapRef = useRef<ChargeHubMapHandle>(null);
  const [selectedCharger, setSelectedCharger] = useState<Charger | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [focusedFavoriteId, setFocusedFavoriteId] = useState<string | null>(
    null
  );
  const {
    errorMessage,
    isLoading,
    location,
    permissionStatus,
    retry,
    showRetry
  } = useCurrentLocation();
  const { isFavorite, toggleFavorite } = useFavorites();
  const selectedFilters = useChargeHubDiagnosticsStore(
    (state) => state.selectedFilters
  );
  const setHomeDiagnostics = useChargeHubDiagnosticsStore(
    (state) => state.setHomeDiagnostics
  );
  const toggleFilter = useChargeHubDiagnosticsStore(
    (state) => state.toggleFilter
  );
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
  const filteredChargers = useMemo(
    () => filterChargers(chargers, selectedFilters),
    [chargers, selectedFilters]
  );
  const showFilterEmpty =
    selectedFilters.length > 0 &&
    chargers.length > 0 &&
    filteredChargers.length === 0;

  useEffect(() => {
    setHomeDiagnostics({
      chargerCount: chargers.length,
      lastKnownLocation: location,
      permissionStatus
    });
  }, [
    chargers.length,
    location,
    permissionStatus,
    selectedFilters,
    setHomeDiagnostics
  ]);

  useEffect(() => {
    if (!selectedCharger || !visibleRegion) {
      return;
    }

    if (focusedFavoriteId === selectedCharger.id) {
      if (isChargerVisible(selectedCharger, visibleRegion)) {
        setFocusedFavoriteId(null);
      }

      return;
    }

    if (!isChargerVisible(selectedCharger, visibleRegion)) {
      setSelectedCharger(null);
    }
  }, [focusedFavoriteId, selectedCharger, visibleRegion]);

  useEffect(() => {
    const favoriteCharger = route.params?.charger;

    if (!favoriteCharger) {
      return;
    }

    setSelectedCharger(favoriteCharger);
    setFocusedFavoriteId(favoriteCharger.id);
    mapRef.current?.moveToCoordinates(
      getSheetAwareCenter(favoriteCharger, null),
      searchMapRegionDelta
    );
  }, [route.params?.charger, route.params?.focusRequestId]);

  const handleSearch = async (query: string) => {
    setSelectedCharger(null);
    setSearchError(null);
    setIsSearching(true);

    try {
      const coordinates = await geocodePlace(query);

      if (!coordinates) {
        setSearchError('No place found. Try a more specific search.');
        return;
      }

      if (coordinates.isBroad) {
        setSearchError(
          'That result is too broad. Add a city, area, or street and try again.'
        );
        return;
      }

      mapRef.current?.moveToCoordinates(coordinates, searchMapRegionDelta);
      Keyboard.dismiss();
    } catch {
      setSearchError('Unable to search right now. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectCharger = (charger: Charger) => {
    setSelectedCharger(charger);
    mapRef.current?.moveToCoordinates(
      getSheetAwareCenter(charger, visibleRegion),
      visibleRegion?.latitudeDelta ?? searchMapRegionDelta
    );
  };

  const handleToggleFilter = (filter: ChargerFilter) => {
    setSelectedCharger(null);
    toggleFilter(filter);
  };

  const handleReportIssue = (charger: Charger) => {
    navigation.navigate('Diagnostics', {
      initialFeedbackMessage: `Wrong charger info reported for ${charger.name} (ID: ${charger.id}).\n\n`,
      initialFeedbackType: 'wrong_charger_info',
      reportChargerId: charger.id,
      reportChargerLatitude: charger.latitude,
      reportChargerLongitude: charger.longitude,
      reportChargerName: charger.name,
      reportRequestId: `${charger.id}-${Date.now()}`
    });
  };

  return (
    <View className="flex-1 bg-white">
      <MapView
        ref={mapRef}
        chargers={filteredChargers}
        location={location}
        onChargerPress={handleSelectCharger}
        onRegionChangeComplete={handleRegionChangeComplete}
        selectedChargerId={selectedCharger?.id ?? null}
      />
      {isLoading ? <LoadingState message="Finding your location..." /> : null}
      {showError ? (
        <View
          className="absolute inset-x-5 top-64 rounded-lg bg-white px-4 py-4 shadow"
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
          className="absolute inset-x-5 top-64 rounded-lg bg-white px-4 py-3 shadow"
          pointerEvents="none"
        >
          <Text className="text-sm text-neutral-700">
            Loading nearby chargers...
          </Text>
        </View>
      ) : null}
      {isRefreshingChargers ? (
        <View
          className="absolute right-5 top-64 h-10 w-10 items-center justify-center rounded-full bg-white shadow"
          pointerEvents="none"
        >
          <ActivityIndicator size="small" />
        </View>
      ) : null}
      {showChargersEmpty ? (
        <View
          className="absolute inset-x-5 top-64 rounded-lg bg-white px-4 py-4 shadow"
          pointerEvents="none"
        >
          <Text className="text-sm font-medium text-neutral-700">
            No nearby chargers found yet.
          </Text>
        </View>
      ) : null}
      {isChargersError ? (
        <View
          className="absolute inset-x-5 top-64 rounded-lg bg-white px-4 py-4 shadow"
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
          <Text className="overflow-hidden rounded-lg bg-white px-3 py-2 text-sm text-neutral-700 shadow">
            Tap My Location to try again.
          </Text>
        </View>
      ) : null}
      <View className="absolute inset-x-4" style={{ top: insets.top + 12 }}>
        <SearchBar
          errorMessage={searchError}
          isLoading={isSearching}
          onSubmit={(query) => void handleSearch(query)}
        />
        <FilterChips
          chargerCount={filteredChargers.length}
          onToggle={handleToggleFilter}
          selectedFilters={selectedFilters}
          showEmptyState={showFilterEmpty}
        />
      </View>
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
          isFavorite={isFavorite(selectedCharger.id)}
          onClose={() => setSelectedCharger(null)}
          onReportIssue={() => handleReportIssue(selectedCharger)}
          onToggleFavorite={() => void toggleFavorite(selectedCharger)}
        />
      ) : null}
    </View>
  );
}
