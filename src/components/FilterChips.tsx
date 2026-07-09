import { Pressable, ScrollView, Text, View } from 'react-native';

import { ChargerFilter, chargerFilterOptions } from '@/utils/filterChargers';

type FilterChipsProps = {
  chargerCount: number;
  onToggle: (filter: ChargerFilter) => void;
  selectedFilters: readonly ChargerFilter[];
  showEmptyState: boolean;
};

export function FilterChips({
  chargerCount,
  onToggle,
  selectedFilters,
  showEmptyState
}: FilterChipsProps) {
  return (
    <View className="mt-2">
      <ScrollView
        horizontal
        keyboardShouldPersistTaps="handled"
        showsHorizontalScrollIndicator={false}
      >
        {chargerFilterOptions.map((option) => {
          const isSelected = selectedFilters.includes(option.id);

          return (
            <Pressable
              key={option.id}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              className={`mr-2 h-10 justify-center rounded-full border px-4 ${
                isSelected
                  ? 'border-neutral-950 bg-neutral-950'
                  : 'border-neutral-200 bg-white'
              }`}
              onPress={() => onToggle(option.id)}
            >
              <Text
                className={`text-sm font-semibold ${
                  isSelected ? 'text-white' : 'text-neutral-800'
                }`}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
      <Text className="mt-2 self-start rounded-sm bg-white px-2 py-1 text-xs font-medium text-neutral-700 shadow">
        {chargerCount} {chargerCount === 1 ? 'charger' : 'chargers'} found
      </Text>
      {showEmptyState ? (
        <View className="mt-2 rounded-md bg-white px-4 py-3 shadow">
          <Text className="text-sm text-neutral-700">
            No chargers match these filters.
          </Text>
        </View>
      ) : null}
    </View>
  );
}
