import { Pressable, Text } from 'react-native';

type FavoriteButtonProps = {
  isFavorite: boolean;
  onPress: () => void;
};

export function FavoriteButton({ isFavorite, onPress }: FavoriteButtonProps) {
  return (
    <Pressable
      accessibilityLabel={isFavorite ? 'Remove favorite' : 'Save favorite'}
      accessibilityRole="button"
      className={`h-11 w-11 items-center justify-center rounded-full ${
        isFavorite ? 'bg-red-50' : 'bg-neutral-100'
      }`}
      hitSlop={8}
      onPress={onPress}
    >
      <Text
        className={`text-xl font-semibold ${
          isFavorite ? 'text-red-600' : 'text-neutral-700'
        }`}
      >
        {isFavorite ? '♥' : '♡'}
      </Text>
    </Pressable>
  );
}
