import { useRef } from 'react';
import { Text, View } from 'react-native';

import { LoadingState } from '@/components/LoadingState';
import { ChargeHubMapHandle, MapView } from '@/components/MapView';
import { MyLocationButton } from '@/components/MyLocationButton';
import { useCurrentLocation } from '@/hooks/useCurrentLocation';
import { locationPermissionStatus } from '@/services/location';

export function HomeScreen() {
  const mapRef = useRef<ChargeHubMapHandle>(null);
  const {
    errorMessage,
    isLoading,
    location,
    permissionStatus,
    retry,
    showRetry
  } = useCurrentLocation();

  const isPermissionDenied =
    permissionStatus === locationPermissionStatus.DENIED;
  const showError = isPermissionDenied || errorMessage !== null;

  return (
    <View className="flex-1 bg-white">
      <MapView ref={mapRef} location={location} />
      {isLoading ? <LoadingState message="Finding your location..." /> : null}
      {showError ? (
        <View className="absolute inset-x-5 top-16 rounded-md bg-white px-4 py-4 shadow">
          <Text className="text-base font-semibold text-neutral-950">
            Location needed
          </Text>
          <Text className="mt-1 text-sm text-neutral-600">
            Allow location access so ChargeHub can center the map around you.
          </Text>
        </View>
      ) : null}
      {showRetry ? (
        <View className="absolute bottom-28 right-5">
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
    </View>
  );
}
