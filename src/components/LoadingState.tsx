import { ActivityIndicator, Text, View } from 'react-native';

type LoadingStateProps = {
  message: string;
};

export function LoadingState({ message }: LoadingStateProps) {
  return (
    <View className="absolute inset-0 items-center justify-center bg-white/90 px-6">
      <ActivityIndicator />
      <Text className="mt-3 text-center text-base text-neutral-700">
        {message}
      </Text>
    </View>
  );
}
