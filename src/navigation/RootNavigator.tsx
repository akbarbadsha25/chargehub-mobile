import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { Text, View } from 'react-native';

import { DiagnosticsScreen } from '@/screens/DiagnosticsScreen';
import { FavoritesScreen } from '@/screens/FavoritesScreen';
import { HomeScreen } from '@/screens/HomeScreen';

import type { Charger } from '@/services/chargers';

export type MainTabParamList = {
  Diagnostics: undefined;
  Favorites: undefined;
  Home:
    | {
        charger: Charger;
        focusRequestId: string;
      }
    | undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

type PlaceholderScreenProps = {
  title: string;
};

function PlaceholderScreen({ title }: PlaceholderScreenProps) {
  return (
    <View className="flex-1 items-center justify-center bg-white px-6">
      <Text className="text-xl font-semibold text-neutral-950">{title}</Text>
    </View>
  );
}

export function RootNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: '#171717',
          tabBarIcon: ({ color }) => {
            const icons: Record<keyof MainTabParamList, string> = {
              Diagnostics: '!',
              Favorites: '♡',
              Home: '⌖',
              Settings: '*'
            };

            return <Text style={{ color }}>{icons[route.name]}</Text>;
          },
          tabBarInactiveTintColor: '#737373'
        })}
      >
        <Tab.Screen component={HomeScreen} name="Home" />
        <Tab.Screen component={FavoritesScreen} name="Favorites" />
        <Tab.Screen component={DiagnosticsScreen} name="Diagnostics" />
        <Tab.Screen name="Settings">
          {() => <PlaceholderScreen title="Settings" />}
        </Tab.Screen>
      </Tab.Navigator>
    </NavigationContainer>
  );
}
