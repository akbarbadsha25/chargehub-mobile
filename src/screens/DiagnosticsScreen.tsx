import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useFocusEffect } from '@react-navigation/native';
import * as Location from 'expo-location';
import { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { feedbackTypeLabels, FeedbackForm } from '@/components/FeedbackForm';
import { useFeedback } from '@/hooks/useFeedback';
import { CurrentLocation, LocationPermissionStatus } from '@/services/location';
import { useChargeHubDiagnosticsStore } from '@/store';
import { chargerFilterOptions } from '@/utils/filterChargers';

import type { MainTabParamList } from '@/navigation/RootNavigator';

const appVersion = '1.0.0';

type DiagnosticsScreenProps = BottomTabScreenProps<
  MainTabParamList,
  'Diagnostics'
>;

type DiagnosticRowProps = {
  label: string;
  value: string;
};

function DiagnosticRow({ label, value }: DiagnosticRowProps) {
  return (
    <View className="border-t border-neutral-100 py-4">
      <Text className="text-xs font-semibold uppercase text-neutral-500">
        {label}
      </Text>
      <Text className="mt-1 text-sm text-neutral-950">{value}</Text>
    </View>
  );
}

function formatLocation(location: CurrentLocation | null) {
  if (!location) {
    return 'Unavailable';
  }

  return `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`;
}

function formatPermissionStatus(status: LocationPermissionStatus) {
  return status === 'unknown' ? 'Unavailable' : status;
}

export function DiagnosticsScreen({ route }: DiagnosticsScreenProps) {
  const insets = useSafeAreaInsets();
  const {
    addFeedback,
    clearFeedback,
    errorMessage,
    feedback,
    isLoading,
    isSubmitting
  } = useFeedback();
  const diagnostics = useChargeHubDiagnosticsStore();
  const [deviceLocation, setDeviceLocation] = useState<CurrentLocation | null>(
    null
  );
  const [devicePermissionStatus, setDevicePermissionStatus] =
    useState<LocationPermissionStatus>('unknown');

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      async function loadDeviceDiagnostics() {
        try {
          const [permission, lastKnownLocation] = await Promise.all([
            Location.getForegroundPermissionsAsync(),
            Location.getLastKnownPositionAsync()
          ]);

          if (!isMounted) {
            return;
          }

          setDevicePermissionStatus(permission.status);

          if (lastKnownLocation) {
            setDeviceLocation({
              accuracy: lastKnownLocation.coords.accuracy,
              latitude: lastKnownLocation.coords.latitude,
              longitude: lastKnownLocation.coords.longitude
            });
          }
        } catch {
          if (isMounted) {
            setDevicePermissionStatus('unknown');
          }
        }
      }

      void loadDeviceDiagnostics();

      return () => {
        isMounted = false;
      };
    }, [])
  );

  const activeFilterLabels = useMemo(() => {
    const labels = chargerFilterOptions
      .filter((option) => diagnostics.activeFilters.includes(option.id))
      .map((option) => option.label);

    return labels.length > 0 ? labels.join(', ') : 'None';
  }, [diagnostics.activeFilters]);

  const permissionStatus =
    diagnostics.permissionStatus === 'unknown'
      ? devicePermissionStatus
      : diagnostics.permissionStatus;
  const lastKnownLocation = diagnostics.lastKnownLocation ?? deviceLocation;
  const handleClearFeedback = () => {
    Alert.alert(
      'Clear feedback?',
      'This removes all locally submitted beta feedback from this device.',
      [
        { style: 'cancel', text: 'Cancel' },
        {
          onPress: () => void clearFeedback(),
          style: 'destructive',
          text: 'Clear'
        }
      ]
    );
  };

  return (
    <ScrollView
      className="flex-1 bg-neutral-50"
      contentContainerStyle={{
        paddingBottom: insets.bottom + 32,
        paddingHorizontal: 20,
        paddingTop: insets.top + 16
      }}
      keyboardShouldPersistTaps="handled"
    >
      <Text className="text-2xl font-semibold leading-8 text-neutral-950">
        Diagnostics
      </Text>
      <Text className="mt-2 text-sm leading-5 text-neutral-600">
        Quick beta context and locally stored feedback.
      </Text>

      <View className="mt-6 rounded-lg border border-neutral-200 bg-white px-4 shadow-sm">
        <Text className="py-4 text-lg font-semibold text-neutral-950">
          App status
        </Text>
        <DiagnosticRow label="App version" value={appVersion} />
        <DiagnosticRow label="Platform" value={Platform.OS} />
        <DiagnosticRow
          label="Location permission"
          value={formatPermissionStatus(permissionStatus)}
        />
        <DiagnosticRow
          label="Last known location"
          value={formatLocation(lastKnownLocation)}
        />
        <DiagnosticRow
          label="Chargers loaded"
          value={
            diagnostics.chargerCount === null
              ? 'Unavailable'
              : String(diagnostics.chargerCount)
          }
        />
        <DiagnosticRow label="Active filters" value={activeFilterLabels} />
      </View>

      <View className="mt-6">
        <FeedbackForm
          initialMessage={route.params?.initialFeedbackMessage}
          initialType={route.params?.initialFeedbackType}
          isSubmitting={isSubmitting}
          onSubmit={addFeedback}
          prefillRequestId={route.params?.reportRequestId}
        />
      </View>

      <View className="mt-6 rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
        <View className="flex-row items-center justify-between">
          <Text className="mr-3 flex-1 text-lg font-semibold text-neutral-950">
            Submitted feedback
          </Text>
          {feedback.length > 0 ? (
            <Pressable
              accessibilityLabel="Clear all submitted feedback"
              accessibilityRole="button"
              className="h-11 justify-center rounded-full bg-neutral-100 px-4"
              onPress={handleClearFeedback}
            >
              <Text className="text-sm font-semibold text-neutral-800">
                Clear
              </Text>
            </Pressable>
          ) : null}
        </View>

        {errorMessage ? (
          <Text className="mt-3 text-sm text-red-700">{errorMessage}</Text>
        ) : null}

        {isLoading ? (
          <Text className="mt-3 text-sm text-neutral-600">
            Loading submitted feedback...
          </Text>
        ) : null}

        {!isLoading && feedback.length === 0 ? (
          <Text className="mt-4 text-sm leading-5 text-neutral-600">
            No submitted feedback yet.
          </Text>
        ) : null}

        {!isLoading
          ? feedback.map((item) => (
              <View
                key={item.id}
                className="mt-4 border-t border-neutral-100 pt-4"
              >
                <Text className="text-sm font-semibold text-neutral-950">
                  {feedbackTypeLabels[item.type]}
                </Text>
                <Text className="mt-1 text-sm leading-5 text-neutral-700">
                  {item.message}
                </Text>
                {item.contact ? (
                  <Text className="mt-1 text-xs text-neutral-500">
                    Contact: {item.contact}
                  </Text>
                ) : null}
                <Text className="mt-1 text-xs text-neutral-500">
                  {new Date(item.createdAt).toLocaleString()}
                </Text>
              </View>
            ))
          : null}
      </View>
    </ScrollView>
  );
}
