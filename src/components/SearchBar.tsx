import { useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  Pressable,
  Text,
  TextInput,
  View
} from 'react-native';

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
    <View>
      <View className="h-12 flex-row items-center rounded-lg bg-white px-4 shadow">
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
          <View className="ml-3 flex-row items-center">
            <ActivityIndicator size="small" />
            <Text className="ml-2 text-sm font-semibold text-neutral-700">
              Searching...
            </Text>
          </View>
        ) : (
          <Pressable
            accessibilityLabel="Search"
            accessibilityRole="button"
            className="ml-3 h-11 justify-center px-2"
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
        <View className="mt-2 rounded-lg bg-white px-4 py-3 shadow">
          <Text className="text-sm font-medium text-red-700">
            {errorMessage}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
