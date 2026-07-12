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
  value: string;
};

function DetailRow({ icon, value }: DetailRowProps) {
  return (
    <View className="mt-4 flex-row items-start rounded-xl bg-neutral-50 p-3">
      <View className="h-9 w-9 items-center justify-center rounded-full bg-white">
        <Text className="text-sm font-bold text-neutral-700">{icon}</Text>
      </View>
      <View className="ml-3 flex-1">
        <Text className="text-sm leading-5 text-neutral-800" numberOfLines={3}>
          {value}
        </Text>
      </View>
    </View>
  );
}

type StatCardProps = {
  label: string;
  value: string;
};

function StatCard({ label, value }: StatCardProps) {
  return (
    <View className="flex-1 rounded-xl border border-neutral-100 bg-neutral-50 p-4">
      <Text className="text-xs font-semibold uppercase text-neutral-500">
        {label}
      </Text>
      <Text
        className="mt-2 text-base font-semibold leading-5 text-neutral-950"
        numberOfLines={2}
      >
        {value}
      </Text>
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
  const previousChargerId = useRef<string | null>(null);

  useEffect(() => {
    const isFirstOpen = previousChargerId.current === null;
    const isNewCharger = previousChargerId.current !== charger.id;

    if (!isNewCharger) {
      return;
    }

    previousChargerId.current = charger.id;
    translateY.setValue(isFirstOpen ? 320 : 20);
    opacity.setValue(isFirstOpen ? 0 : 0.9);

    Animated.parallel([
      Animated.spring(translateY, {
        damping: 20,
        stiffness: 190,
        toValue: 0,
        useNativeDriver: true
      }),
      Animated.timing(opacity, {
        duration: 160,
        toValue: 1,
        useNativeDriver: true
      })
    ]).start();
  }, [charger.id, opacity, translateY]);

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
      className="absolute inset-x-0 bottom-0 rounded-t-3xl bg-white px-5 pb-5 pt-3 shadow"
      style={{ opacity, transform: [{ translateY }] }}
    >
      <View className="mb-4 items-center">
        <View className="h-1 w-12 rounded-full bg-neutral-300" />
      </View>

      <View className="flex-row items-start justify-between">
        <View className="mr-4 flex-1">
          <Text
            className="text-xl font-semibold leading-6 text-neutral-950"
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
          <View className="mt-4 flex-row rounded-xl bg-neutral-50 p-3">
            <View className="flex-1">
              <Text className="text-xs font-semibold uppercase text-neutral-500">
                Status
              </Text>
              <View className="mt-2 flex-row items-center">
                <View className="mr-2 h-2.5 w-2.5 rounded-full bg-neutral-950" />
                <Text
                  className="text-sm font-semibold text-neutral-950"
                  numberOfLines={1}
                >
                  Status unknown
                </Text>
              </View>
            </View>
            <View className="ml-4 flex-1">
              <Text className="text-xs font-semibold uppercase text-neutral-500">
                Distance
              </Text>
              <Text
                className="mt-2 text-sm font-semibold text-neutral-950"
                numberOfLines={1}
              >
                {charger.distanceKm !== null
                  ? `${charger.distanceKm.toFixed(1)} km away`
                  : 'Unavailable'}
              </Text>
            </View>
          </View>

          {charger.address ? (
            <DetailRow icon="⌖" value={charger.address} />
          ) : null}

          <View className="mt-4 flex-row">
            <StatCard
              label="Connector"
              value={charger.connectorType ?? 'Unknown'}
            />
            <View className="w-3" />
            <StatCard
              label="Power"
              value={
                charger.powerKw !== null ? `${charger.powerKw} kW` : 'Unknown'
              }
            />
          </View>
        </>
      )}

      <Pressable
        accessibilityLabel={`Get directions to ${charger.name}`}
        accessibilityRole="button"
        className="mt-5 h-[50px] items-center justify-center rounded-xl bg-neutral-950 px-4"
        onPress={() => void handleDirections()}
      >
        <Text className="text-base font-semibold text-white">
          Get Directions
        </Text>
      </Pressable>
    </Animated.View>
  );
}
