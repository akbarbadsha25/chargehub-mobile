import { Pressable, Text, View } from 'react-native';

import { Charger } from '@/services/chargers';

type ChargerBottomSheetProps = {
  charger: Charger;
  onClose: () => void;
};

type DetailRowProps = {
  label: string;
  value: string;
};

function DetailRow({ label, value }: DetailRowProps) {
  return (
    <View className="mt-3">
      <Text className="text-xs font-semibold uppercase text-neutral-500">
        {label}
      </Text>
      <Text className="mt-1 text-sm text-neutral-800">{value}</Text>
    </View>
  );
}

export function ChargerBottomSheet({
  charger,
  onClose
}: ChargerBottomSheetProps) {
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
        <Pressable
          accessibilityLabel="Close charger details"
          accessibilityRole="button"
          className="h-10 w-10 items-center justify-center rounded-full bg-neutral-100"
          hitSlop={8}
          onPress={onClose}
        >
          <Text className="text-lg font-semibold text-neutral-700">X</Text>
        </Pressable>
      </View>

      {charger.address ? (
        <DetailRow label="Address" value={charger.address} />
      ) : null}
      {charger.distanceKm !== null ? (
        <DetailRow
          label="Distance"
          value={`${charger.distanceKm.toFixed(1)} km`}
        />
      ) : null}
      {charger.connectorType ? (
        <DetailRow label="Connector" value={charger.connectorType} />
      ) : null}
      {charger.powerKw !== null ? (
        <DetailRow label="Power" value={`${charger.powerKw} kW`} />
      ) : null}

      <Pressable
        accessibilityRole="button"
        className="mt-5 items-center rounded-md bg-neutral-200 px-4 py-3"
        disabled
      >
        <Text className="font-semibold text-neutral-500">Navigate</Text>
      </Pressable>
    </View>
  );
}
