import { useEffect, useRef } from 'react';
import { Alert, Animated, Pressable, Text, View } from 'react-native';

import { FavoriteButton } from '@/components/FavoriteButton';
import { Charger } from '@/services/chargers';
import { openDirections } from '@/utils/navigation';

type ChargerBottomSheetProps = {
  charger: Charger;
  isLoadingDetails?: boolean;
  isFavorite: boolean;
  onClose: () => void;
  onToggleFavorite: () => void;
};

type DetailRowProps = {
  icon: string;
  label: string;
  value: string;
};

function DetailRow({ icon, label, value }: DetailRowProps) {
  return (
    <View className="flex-row items-start border-t border-neutral-100 py-4">
      <View className="h-11 w-11 items-center justify-center rounded-full bg-neutral-100">
        <Text className="text-xs font-bold text-neutral-700">{icon}</Text>
      </View>
      <View className="ml-3 flex-1">
        <Text className="text-xs font-semibold uppercase text-neutral-500">
          {label}
        </Text>
        <Text
          className="mt-1 text-sm leading-5 text-neutral-900"
          numberOfLines={label === 'Address' ? 3 : 2}
        >
          {value}
        </Text>
      </View>
    </View>
  );
}

function LoadingSkeleton() {
  return (
    <View className="mt-5">
      <View className="h-5 w-3/4 rounded-md bg-neutral-100" />
      <View className="mt-3 h-4 w-1/2 rounded-md bg-neutral-100" />
      <View className="mt-5 flex-row">
        <View className="h-16 flex-1 rounded-lg bg-neutral-100" />
        <View className="ml-3 h-16 flex-1 rounded-lg bg-neutral-100" />
      </View>
    </View>
  );
}

export function ChargerBottomSheet({
  charger,
  isLoadingDetails = false,
  isFavorite,
  onToggleFavorite,
  onClose
}: ChargerBottomSheetProps) {
  const translateY = useRef(new Animated.Value(320)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(translateY, {
        damping: 18,
        stiffness: 180,
        toValue: 0,
        useNativeDriver: true
      }),
      Animated.timing(opacity, {
        duration: 160,
        toValue: 1,
        useNativeDriver: true
      })
    ]).start();
  }, [opacity, translateY]);

  const handleDirections = async () => {
    try {
      await openDirections(charger.latitude, charger.longitude);
    } catch {
      Alert.alert(
        'Unable to open maps',
        'Please check that a maps application is available and try again.'
      );
    }
  };

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        duration: 180,
        toValue: 320,
        useNativeDriver: true
      }),
      Animated.timing(opacity, {
        duration: 140,
        toValue: 0,
        useNativeDriver: true
      })
    ]).start(onClose);
  };

  return (
    <Animated.View
      className="absolute inset-x-0 bottom-0 rounded-t-2xl bg-white px-6 pb-8 pt-6 shadow"
      style={{ opacity, transform: [{ translateY }] }}
    >
      <View className="flex-row items-start justify-between">
        <View className="mr-4 flex-1">
          <Text
            className="text-xl font-semibold leading-7 text-neutral-950"
            numberOfLines={2}
          >
            {charger.name}
          </Text>
          {charger.provider ? (
            <Text className="mt-1 text-sm text-neutral-600" numberOfLines={1}>
              {charger.provider}
            </Text>
          ) : null}
        </View>
        <View className="flex-row">
          <FavoriteButton isFavorite={isFavorite} onPress={onToggleFavorite} />
          <Pressable
            accessibilityLabel="Close charger details"
            accessibilityRole="button"
            className="ml-2 h-11 w-11 items-center justify-center rounded-full bg-neutral-100"
            hitSlop={8}
            onPress={handleClose}
          >
            <Text className="text-lg font-semibold text-neutral-700">X</Text>
          </Pressable>
        </View>
      </View>

      {isLoadingDetails ? (
        <LoadingSkeleton />
      ) : (
        <>
          <View className="mt-5 flex-row">
            <View className="mr-3 flex-1 rounded-lg bg-neutral-50 p-4">
              <Text className="text-xs font-semibold uppercase text-neutral-500">
                Connector
              </Text>
              <Text className="mt-2 text-sm font-semibold text-neutral-950">
                {charger.connectorType ?? 'Unknown'}
              </Text>
            </View>
            <View className="flex-1 rounded-lg bg-neutral-50 p-4">
              <Text className="text-xs font-semibold uppercase text-neutral-500">
                Power
              </Text>
              <Text className="mt-2 text-sm font-semibold text-neutral-950">
                {charger.powerKw !== null ? `${charger.powerKw} kW` : 'Unknown'}
              </Text>
            </View>
          </View>

          <View className="mt-2">
            {charger.address ? (
              <DetailRow icon="PIN" label="Address" value={charger.address} />
            ) : null}
            {charger.distanceKm !== null ? (
              <DetailRow
                icon="KM"
                label="Distance"
                value={`${charger.distanceKm.toFixed(1)} km`}
              />
            ) : null}
          </View>
        </>
      )}

      <Pressable
        accessibilityLabel={`Get directions to ${charger.name}`}
        accessibilityRole="button"
        className="mt-4 h-12 items-center justify-center rounded-lg bg-neutral-950 px-4"
        onPress={() => void handleDirections()}
      >
        <Text className="font-semibold text-white">Get Directions</Text>
      </Pressable>
    </Animated.View>
  );
}
