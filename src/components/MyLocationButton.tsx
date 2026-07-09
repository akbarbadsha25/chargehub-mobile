import { Pressable, Text } from 'react-native';

type MyLocationButtonProps = {
  disabled?: boolean;
  onPress: () => void;
};

export function MyLocationButton({
  disabled = false,
  onPress
}: MyLocationButtonProps) {
  return (
    <Pressable
      accessibilityLabel="Center map on my location"
      accessibilityRole="button"
      className={`absolute bottom-24 right-5 h-14 w-14 items-center justify-center rounded-full shadow ${
        disabled ? 'bg-neutral-300' : 'bg-neutral-950'
      }`}
      disabled={disabled}
      onPress={onPress}
    >
      <Text className="text-2xl font-semibold text-white">⌖</Text>
    </Pressable>
  );
}
