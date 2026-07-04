import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { useCurrentLocation } from '@/hooks/useCurrentLocation';

function formatCoordinate(value: number | undefined) {
  return value === undefined ? 'Unavailable' : value.toFixed(6);
}

function formatAccuracy(value: number | null | undefined) {
  return value == null ? 'Unavailable' : `${Math.round(value)} m`;
}

export function HomeScreen() {
  const {
    errorMessage,
    isLoading,
    location,
    permissionStatus,
    retry,
    showRetry
  } = useCurrentLocation();

  return (
    <View className="flex-1 justify-center bg-white px-6">
      <Text className="text-center text-xl font-semibold text-neutral-950">
        ChargeHub MVP
      </Text>
      <View className="mt-6 gap-3">
        <Text className="text-base text-neutral-700">
          Permission status: {permissionStatus}
        </Text>
        <Text className="text-base text-neutral-700">
          Latitude: {formatCoordinate(location?.latitude)}
        </Text>
        <Text className="text-base text-neutral-700">
          Longitude: {formatCoordinate(location?.longitude)}
        </Text>
        <Text className="text-base text-neutral-700">
          Accuracy: {formatAccuracy(location?.accuracy)}
        </Text>
        {isLoading ? (
          <View className="flex-row items-center gap-2">
            <ActivityIndicator />
            <Text className="text-base text-neutral-700">
              Requesting location...
            </Text>
          </View>
        ) : null}
        {!isLoading && !location && !errorMessage ? (
          <Text className="text-base text-neutral-600">
            Location is not available yet.
          </Text>
        ) : null}
        {errorMessage ? (
          <Text className="text-base text-red-600">{errorMessage}</Text>
        ) : null}
      </View>
      {showRetry ? (
        <Pressable
          className="mt-6 items-center rounded-md bg-neutral-950 px-4 py-3"
          onPress={retry}
        >
          <Text className="font-semibold text-white">Retry Location</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
