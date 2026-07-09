import { useEffect, useRef } from 'react';
import { Animated, Pressable, ScrollView, Text, View } from 'react-native';

import { ChargerFilter, chargerFilterOptions } from '@/utils/filterChargers';

type FilterChipsProps = {
  chargerCount: number;
  onToggle: (filter: ChargerFilter) => void;
  selectedFilters: readonly ChargerFilter[];
  showEmptyState: boolean;
};

type FilterChipProps = {
  isSelected: boolean;
  label: string;
  onPress: () => void;
};

function FilterChip({ isSelected, label, onPress }: FilterChipProps) {
  const scale = useRef(new Animated.Value(isSelected ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(scale, {
      damping: 16,
      stiffness: 220,
      toValue: isSelected ? 1 : 0,
      useNativeDriver: true
    }).start();
  }, [isSelected, scale]);

  const chipScale = scale.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.04]
  });

  return (
    <Animated.View
      className="mr-2"
      style={{ transform: [{ scale: chipScale }] }}
    >
      <Pressable
        accessibilityLabel={`${label} filter`}
        accessibilityRole="button"
        accessibilityState={{ selected: isSelected }}
        className={`h-11 justify-center rounded-full border px-4 ${
          isSelected
            ? 'border-neutral-950 bg-neutral-950'
            : 'border-neutral-200 bg-white'
        }`}
        onPress={onPress}
      >
        <Text
          className={`text-sm font-semibold ${
            isSelected ? 'text-white' : 'text-neutral-800'
          }`}
        >
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

export function FilterChips({
  chargerCount,
  onToggle,
  selectedFilters,
  showEmptyState
}: FilterChipsProps) {
  return (
    <View className="mt-3">
      <ScrollView
        contentContainerStyle={{ paddingRight: 16 }}
        horizontal
        keyboardShouldPersistTaps="handled"
        showsHorizontalScrollIndicator={false}
      >
        {chargerFilterOptions.map((option) => {
          const isSelected = selectedFilters.includes(option.id);

          return (
            <FilterChip
              key={option.id}
              isSelected={isSelected}
              label={option.label}
              onPress={() => onToggle(option.id)}
            />
          );
        })}
      </ScrollView>
      <Text className="mt-2 self-start rounded-md bg-white px-3 py-2 text-xs font-semibold text-neutral-700 shadow">
        {chargerCount} {chargerCount === 1 ? 'charger' : 'chargers'} found
      </Text>
      {showEmptyState ? (
        <View className="mt-2 rounded-lg bg-white px-4 py-3 shadow">
          <Text className="text-sm font-medium text-neutral-700">
            No chargers match these filters.
          </Text>
        </View>
      ) : null}
    </View>
  );
}
