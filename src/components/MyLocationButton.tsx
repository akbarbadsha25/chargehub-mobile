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
      className={`absolute bottom-8 right-5 rounded-full px-5 py-4 shadow ${
        disabled ? 'bg-neutral-300' : 'bg-neutral-950'
      }`}
      disabled={disabled}
      onPress={onPress}
    >
      <Text className="font-semibold text-white">My Location</Text>
    </Pressable>
  );
}
