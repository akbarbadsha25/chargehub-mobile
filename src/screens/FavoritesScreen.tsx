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
      accessibilityRole="button"
      className="mb-3 rounded-md border border-neutral-200 bg-white p-4 shadow-sm"
      onPress={() => onPress(charger)}
    >
      <Text className="text-base font-semibold text-neutral-950">
        {charger.name}
      </Text>
      {details.length > 0 ? (
        <Text className="mt-2 text-sm leading-5 text-neutral-600">
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
        <Text className="text-2xl font-semibold text-neutral-950">
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
          <Text className="text-center text-base text-neutral-600">
            No favorite chargers yet.
          </Text>
        </View>
      ) : null}

      {!isLoading && favorites.length > 0 ? (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 20, paddingBottom: 32 }}
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
