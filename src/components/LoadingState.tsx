import { ActivityIndicator, Text, View } from 'react-native';

type LoadingStateProps = {
  message: string;
};

export function LoadingState({ message }: LoadingStateProps) {
  return (
    <View
      className="absolute inset-0 items-center justify-center bg-white/90 px-6"
      pointerEvents="none"
    >
      <ActivityIndicator />
      <Text className="mt-4 text-center text-base font-medium text-neutral-700">
        {message}
      </Text>
    </View>
  );
}
