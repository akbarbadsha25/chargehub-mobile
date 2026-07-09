import { useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  Pressable,
  Text,
  TextInput,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type SearchBarProps = {
  errorMessage: string | null;
  isLoading: boolean;
  onSubmit: (query: string) => void;
};

export function SearchBar({
  errorMessage,
  isLoading,
  onSubmit
}: SearchBarProps) {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const normalizedQuery = query.trim();

  const handleSubmit = () => {
    if (!normalizedQuery || isLoading) {
      return;
    }

    Keyboard.dismiss();
    onSubmit(normalizedQuery);
  };

  return (
    <View className="absolute inset-x-4" style={{ top: insets.top + 12 }}>
      <View className="h-12 flex-row items-center rounded-md bg-white px-4 shadow">
        <TextInput
          accessibilityLabel="Search for a place"
          autoCapitalize="words"
          className="h-full flex-1 text-base text-neutral-950"
          editable={!isLoading}
          onChangeText={setQuery}
          onSubmitEditing={handleSubmit}
          placeholder="Search city, area, or address"
          placeholderTextColor="#737373"
          returnKeyType="search"
          value={query}
        />
        {isLoading ? (
          <ActivityIndicator className="ml-3" size="small" />
        ) : (
          <Pressable
            accessibilityLabel="Search"
            accessibilityRole="button"
            className="ml-3 h-9 justify-center px-2"
            disabled={!normalizedQuery}
            hitSlop={8}
            onPress={handleSubmit}
          >
            <Text
              className={`font-semibold ${
                normalizedQuery ? 'text-neutral-950' : 'text-neutral-400'
              }`}
            >
              Search
            </Text>
          </Pressable>
        )}
      </View>
      {errorMessage ? (
        <View className="mt-2 rounded-md bg-white px-4 py-3 shadow">
          <Text className="text-sm text-red-700">{errorMessage}</Text>
        </View>
      ) : null}
    </View>
  );
}
