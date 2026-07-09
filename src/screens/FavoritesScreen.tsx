import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useFavorites } from '@/hooks/useFavorites';
import { Charger } from '@/services/chargers';

import type { MainTabParamList } from '@/navigation/RootNavigator';

type FavoritesScreenProps = BottomTabScreenProps<MainTabParamList, 'Favorites'>;

type FavoriteCardProps = {
  charger: Charger;
  onPress: (charger: Charger) => void;
};

function FavoriteCard({ charger, onPress }: FavoriteCardProps) {
  const details = [
    charger.provider,
    charger.address,
    charger.connectorType,
    charger.powerKw !== null ? `${charger.powerKw} kW` : null
  ].filter(Boolean);

  return (
    <Pressable
      accessibilityLabel={`Open favorite charger ${charger.name}`}
      accessibilityRole="button"
      className="mb-4 rounded-lg border border-neutral-200 bg-white p-4 shadow-sm"
      onPress={() => onPress(charger)}
    >
      <View className="flex-row items-start justify-between">
        <Text
          className="mr-3 flex-1 text-base font-semibold leading-6 text-neutral-950"
          numberOfLines={2}
        >
          {charger.name}
        </Text>
        <View className="h-8 w-8 items-center justify-center rounded-full bg-red-50">
          <Text className="text-base font-semibold text-red-600">♥</Text>
        </View>
      </View>
      {details.length > 0 ? (
        <Text className="mt-3 text-sm leading-5 text-neutral-600">
          {details.join(' • ')}
        </Text>
      ) : null}
    </Pressable>
  );
}

export function FavoritesScreen({ navigation }: FavoritesScreenProps) {
  const insets = useSafeAreaInsets();
  const { errorMessage, favorites, isLoading } = useFavorites();

  const handleFavoritePress = (charger: Charger) => {
    navigation.navigate('Home', {
      charger,
      focusRequestId: `${charger.id}-${Date.now()}`
    });
  };

  return (
    <View className="flex-1 bg-neutral-50" style={{ paddingTop: insets.top }}>
      <View className="border-b border-neutral-200 bg-white px-5 pb-4 pt-3">
        <Text className="text-2xl font-semibold leading-8 text-neutral-950">
          Favorites
        </Text>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center px-6">
          <ActivityIndicator />
          <Text className="mt-3 text-center text-base text-neutral-600">
            Loading favorites...
          </Text>
        </View>
      ) : null}

      {!isLoading && favorites.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
            <Text className="text-3xl text-neutral-500">♡</Text>
          </View>
          <Text className="text-center text-lg font-semibold text-neutral-950">
            No favorite chargers yet.
          </Text>
          <Text className="mt-2 text-center text-sm leading-5 text-neutral-600">
            Save chargers from the map to find them quickly during beta tests.
          </Text>
        </View>
      ) : null}

      {!isLoading && favorites.length > 0 ? (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 24, paddingBottom: 32 }}
        >
          {favorites.map((charger) => (
            <FavoriteCard
              key={charger.id}
              charger={charger}
              onPress={handleFavoritePress}
            />
          ))}
          {errorMessage ? (
            <Text className="mt-1 text-sm text-red-700">{errorMessage}</Text>
          ) : null}
        </ScrollView>
      ) : null}
    </View>
  );
}
