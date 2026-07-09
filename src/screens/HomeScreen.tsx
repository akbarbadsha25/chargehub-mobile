import { useRef, useState } from 'react';
import { Text, View } from 'react-native';

import { ChargerBottomSheet } from '@/components/ChargerBottomSheet';
import { LoadingState } from '@/components/LoadingState';
import { ChargeHubMapHandle, MapView } from '@/components/MapView';
import { MyLocationButton } from '@/components/MyLocationButton';
import { useCurrentLocation } from '@/hooks/useCurrentLocation';
import { useNearbyChargers } from '@/hooks/useNearbyChargers';
import { Charger } from '@/services/chargers';
import { locationPermissionStatus } from '@/services/location';

export function HomeScreen() {
  const mapRef = useRef<ChargeHubMapHandle>(null);
  const [selectedCharger, setSelectedCharger] = useState<Charger | null>(null);
  const {
    errorMessage,
    isLoading,
    location,
    permissionStatus,
    retry,
    showRetry
  } = useCurrentLocation();
  const {
    data: chargers = [],
    error: chargersError,
    isError: isChargersError,
    isFetching: isChargersLoading
  } = useNearbyChargers(location);

  const isPermissionDenied =
    permissionStatus === locationPermissionStatus.DENIED;
  const showError = isPermissionDenied || errorMessage !== null;
  const showChargersEmpty =
    Boolean(location) &&
    !isChargersLoading &&
    !isChargersError &&
    chargers.length === 0;

  return (
    <View className="flex-1 bg-white">
      <MapView
        ref={mapRef}
        chargers={chargers}
        location={location}
        onChargerPress={setSelectedCharger}
      />
      {isLoading ? <LoadingState message="Finding your location..." /> : null}
      {showError ? (
        <View
          className="absolute inset-x-5 top-16 rounded-md bg-white px-4 py-4 shadow"
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
      {isChargersLoading ? (
        <View
          className="absolute inset-x-5 top-16 rounded-md bg-white px-4 py-3 shadow"
          pointerEvents="none"
        >
          <Text className="text-sm text-neutral-700">
            Loading nearby chargers...
          </Text>
        </View>
      ) : null}
      {showChargersEmpty ? (
        <View
          className="absolute inset-x-5 top-16 rounded-md bg-white px-4 py-3 shadow"
          pointerEvents="none"
        >
          <Text className="text-sm text-neutral-700">
            No nearby chargers found yet.
          </Text>
        </View>
      ) : null}
      {isChargersError ? (
        <View
          className="absolute inset-x-5 top-16 rounded-md bg-white px-4 py-4 shadow"
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
