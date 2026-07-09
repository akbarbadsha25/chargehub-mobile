import { Alert, Pressable, Text, View } from 'react-native';

import { FavoriteButton } from '@/components/FavoriteButton';
import { Charger } from '@/services/chargers';
import { openDirections } from '@/utils/navigation';

type ChargerBottomSheetProps = {
  charger: Charger;
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
    <View className="flex-row items-center border-t border-neutral-100 py-3">
      <View className="h-10 w-10 items-center justify-center rounded-full bg-neutral-100">
        <Text className="text-xs font-bold text-neutral-700">{icon}</Text>
      </View>
      <View className="ml-3 flex-1">
        <Text className="text-xs font-semibold uppercase text-neutral-500">
          {label}
        </Text>
        <Text className="mt-0.5 text-sm leading-5 text-neutral-900">
          {value}
        </Text>
      </View>
    </View>
  );
}

export function ChargerBottomSheet({
  charger,
  isFavorite,
  onToggleFavorite,
  onClose
}: ChargerBottomSheetProps) {
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

  return (
    <View className="absolute inset-x-0 bottom-0 rounded-t-lg bg-white px-5 pb-8 pt-5 shadow">
      <View className="flex-row items-start justify-between">
        <View className="mr-4 flex-1">
          <Text className="text-xl font-semibold text-neutral-950">
            {charger.name}
          </Text>
          {charger.provider ? (
            <Text className="mt-1 text-sm text-neutral-600">
              {charger.provider}
            </Text>
          ) : null}
        </View>
        <View className="flex-row">
          <FavoriteButton isFavorite={isFavorite} onPress={onToggleFavorite} />
          <Pressable
            accessibilityLabel="Close charger details"
            accessibilityRole="button"
            className="ml-2 h-10 w-10 items-center justify-center rounded-full bg-neutral-100"
            hitSlop={8}
            onPress={onClose}
          >
            <Text className="text-lg font-semibold text-neutral-700">X</Text>
          </Pressable>
        </View>
      </View>

      <View className="mt-4">
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
        {charger.connectorType ? (
          <DetailRow
            icon="TYPE"
            label="Connector"
            value={charger.connectorType}
          />
        ) : null}
        {charger.powerKw !== null ? (
          <DetailRow icon="KW" label="Power" value={`${charger.powerKw} kW`} />
        ) : null}
      </View>

      <Pressable
        accessibilityRole="button"
        className="mt-2 items-center rounded-md bg-neutral-950 px-4 py-3"
        onPress={() => void handleDirections()}
      >
        <Text className="font-semibold text-white">Get Directions</Text>
      </Pressable>
    </View>
  );
}
