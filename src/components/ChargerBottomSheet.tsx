import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View
} from 'react-native';

import { Charger } from '@/services/chargers';
import { openDirections } from '@/utils/navigation';

type ChargerBottomSheetProps = {
  charger: Charger;
  isLoadingDetails?: boolean;
  isFavorite: boolean;
  onClose: () => void;
  onReportIssue: () => void;
  onToggleFavorite: () => void;
};

type DetailRowProps = {
  icon: string;
  value: string;
};

function DetailRow({ icon, value }: DetailRowProps) {
  return (
    <View className="mt-4 flex-row items-start">
      <Text className="mr-3 mt-0.5 text-base text-neutral-500">{icon}</Text>
      <Text
        className="flex-1 text-sm leading-5 text-neutral-600"
        numberOfLines={3}
      >
        {value}
      </Text>
    </View>
  );
}

type MediaCarouselProps = {
  media: Charger['media'];
};

function MediaCarousel({ media }: MediaCarouselProps) {
  const { width } = useWindowDimensions();
  const [activeIndex, setActiveIndex] = useState(0);
  const [failedImageIds, setFailedImageIds] = useState<string[]>([]);
  const imageWidth = width;
  const visibleMedia = useMemo(
    () => media.filter((item) => !failedImageIds.includes(item.id)),
    [failedImageIds, media]
  );

  useEffect(() => {
    if (activeIndex >= visibleMedia.length) {
      setActiveIndex(Math.max(visibleMedia.length - 1, 0));
    }
  }, [activeIndex, visibleMedia.length]);

  if (visibleMedia.length === 0) {
    return null;
  }

  const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    setActiveIndex(Math.round(event.nativeEvent.contentOffset.x / imageWidth));
  };

  return (
    <View className="-mx-5 -mt-3 mb-4 overflow-hidden rounded-t-3xl">
      <ScrollView
        horizontal
        onMomentumScrollEnd={handleScrollEnd}
        pagingEnabled
        showsHorizontalScrollIndicator={false}
      >
        {visibleMedia.map((item) => (
          <View key={item.id} style={{ width: imageWidth }}>
            <Image
              accessibilityLabel={item.attribution ?? 'Charging station photo'}
              className="h-40 w-full bg-neutral-100"
              onError={() =>
                setFailedImageIds((currentIds) => [...currentIds, item.id])
              }
              resizeMode="cover"
              source={{ uri: item.url }}
            />
            {item.attribution ? (
              <View className="absolute bottom-2 left-3 max-w-[80%] rounded-full bg-black/60 px-2 py-1">
                <Text className="text-[10px] font-medium text-white">
                  {item.attribution}
                </Text>
              </View>
            ) : null}
          </View>
        ))}
      </ScrollView>
      {visibleMedia.length > 1 ? (
        <View className="absolute bottom-3 right-3 rounded-full bg-black/60 px-2 py-1">
          <Text className="text-xs font-semibold text-white">
            {activeIndex + 1}/{visibleMedia.length}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

function getStatusLabel(status: Charger['status']) {
  if (status === 'available') {
    return 'Available';
  }

  if (status === 'offline') {
    return 'Offline';
  }

  if (status === 'limited') {
    return 'Limited';
  }

  return 'Status unavailable';
}

function getStatusDotClass(status: Charger['status']) {
  if (status === 'available') {
    return 'bg-green-500';
  }

  if (status === 'offline') {
    return 'bg-red-500';
  }

  if (status === 'limited') {
    return 'bg-orange-500';
  }

  return 'bg-neutral-400';
}

function MetadataRow({ charger }: { charger: Charger }) {
  const distanceText =
    charger.distanceKm !== null
      ? `${charger.distanceKm.toFixed(1)} km away`
      : 'Distance unavailable';

  return (
    <View className="mt-2 flex-row items-center">
      <View
        className={`mr-2 h-2.5 w-2.5 rounded-full ${getStatusDotClass(
          charger.status
        )}`}
      />
      <Text
        className="flex-shrink text-[15px] leading-5 text-neutral-600"
        numberOfLines={1}
      >
        {getStatusLabel(charger.status)} · {distanceText}
      </Text>
    </View>
  );
}

function ChargerSpecsRow({ charger }: { charger: Charger }) {
  const connector = charger.connectorType ?? 'Connector unknown';
  const power =
    charger.powerKw !== null ? `${charger.powerKw} kW` : 'Power unknown';

  return (
    <Text
      className="mt-4 text-[15px] leading-5 text-neutral-600"
      numberOfLines={2}
    >
      🔌 {connector} · ⚡ {power}
    </Text>
  );
}

type ActionChipProps = {
  isSelected?: boolean;
  label: string;
  onPress: () => void;
};

function ActionChip({ isSelected = false, label, onPress }: ActionChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected }}
      className={`h-11 flex-1 items-center justify-center rounded-full border px-3 ${
        isSelected ? 'border-red-200 bg-red-50' : 'border-neutral-200 bg-white'
      }`}
      onPress={onPress}
    >
      <Text
        className={`text-sm font-semibold ${
          isSelected ? 'text-red-700' : 'text-neutral-800'
        }`}
        numberOfLines={1}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function LoadingSkeleton() {
  return (
    <View className="mt-5">
      <View className="h-5 w-3/4 rounded-md bg-neutral-100" />
      <View className="mt-3 h-4 w-1/2 rounded-md bg-neutral-100" />
      <View className="mt-5 flex-row">
        <View className="h-16 flex-1 rounded-lg bg-neutral-100" />
        <View className="ml-3 h-16 flex-1 rounded-lg bg-neutral-100" />
      </View>
    </View>
  );
}

export function ChargerBottomSheet({
  charger,
  isLoadingDetails = false,
  isFavorite,
  onReportIssue,
  onToggleFavorite,
  onClose
}: ChargerBottomSheetProps) {
  const translateY = useRef(new Animated.Value(320)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const previousChargerId = useRef<string | null>(null);
  const hasMedia = charger.media.length > 0;

  useEffect(() => {
    const isFirstOpen = previousChargerId.current === null;
    const isNewCharger = previousChargerId.current !== charger.id;

    if (!isNewCharger) {
      return;
    }

    previousChargerId.current = charger.id;
    translateY.setValue(isFirstOpen ? 320 : 20);
    opacity.setValue(isFirstOpen ? 0 : 0.9);

    Animated.parallel([
      Animated.spring(translateY, {
        damping: 20,
        stiffness: 190,
        toValue: 0,
        useNativeDriver: true
      }),
      Animated.timing(opacity, {
        duration: 160,
        toValue: 1,
        useNativeDriver: true
      })
    ]).start();
  }, [charger.id, opacity, translateY]);

  const handleDirections = async () => {
    try {
      await openDirections(charger.latitude, charger.longitude);
    } catch {
      Alert.alert(
        'Unable to open maps',
        'Please check that a maps application is available and try again.'
      );
    }
  };

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        duration: 180,
        toValue: 320,
        useNativeDriver: true
      }),
      Animated.timing(opacity, {
        duration: 140,
        toValue: 0,
        useNativeDriver: true
      })
    ]).start(onClose);
  };

  return (
    <Animated.View
      className="absolute inset-x-0 bottom-0 rounded-t-3xl bg-white px-5 pb-5 pt-3 shadow"
      style={{ opacity, transform: [{ translateY }] }}
    >
      {hasMedia ? <MediaCarousel media={charger.media} /> : null}

      {!hasMedia ? (
        <View className="mb-4 items-center">
          <View className="h-1 w-12 rounded-full bg-neutral-300" />
        </View>
      ) : null}

      {hasMedia ? (
        <View className="absolute left-5 right-5 top-3 flex-row items-start justify-between">
          <View className="absolute left-1/2 top-0 -ml-6 h-1 w-12 rounded-full bg-white/80" />
          <View className="flex-1" />
          <Pressable
            accessibilityLabel="Close charger details"
            accessibilityRole="button"
            className="h-11 w-11 items-center justify-center rounded-full bg-white/95"
            hitSlop={8}
            onPress={handleClose}
          >
            <Text className="text-lg font-semibold text-neutral-700">X</Text>
          </Pressable>
        </View>
      ) : null}

      <View className="flex-row items-start justify-between">
        <View className="mr-4 flex-1">
          <Text
            className="text-xl font-semibold leading-6 text-neutral-950"
            numberOfLines={2}
          >
            {charger.name}
          </Text>
          {charger.provider ? (
            <Text className="mt-1 text-sm text-neutral-600" numberOfLines={1}>
              {charger.provider}
            </Text>
          ) : null}
          <MetadataRow charger={charger} />
        </View>
        {!hasMedia ? (
          <Pressable
            accessibilityLabel="Close charger details"
            accessibilityRole="button"
            className="h-11 w-11 items-center justify-center rounded-full bg-neutral-100"
            hitSlop={8}
            onPress={handleClose}
          >
            <Text className="text-lg font-semibold text-neutral-700">X</Text>
          </Pressable>
        ) : null}
      </View>

      {isLoadingDetails ? (
        <LoadingSkeleton />
      ) : (
        <>
          {charger.address ? (
            <DetailRow icon="📍" value={charger.address} />
          ) : null}

          <View className="mt-4 h-px bg-neutral-100" />

          <ChargerSpecsRow charger={charger} />

          <View className="mt-4 flex-row">
            <ActionChip
              isSelected={isFavorite}
              label={
                isFavorite ? '♡ Remove from Favorites' : '♡ Add to Favorites'
              }
              onPress={onToggleFavorite}
            />
            <View className="w-3" />
            <ActionChip label="⚠ Report issue" onPress={onReportIssue} />
          </View>
        </>
      )}

      <Pressable
        accessibilityLabel={`Get directions to ${charger.name}`}
        accessibilityRole="button"
        className="mt-5 h-[50px] items-center justify-center rounded-xl bg-neutral-950 px-4"
        onPress={() => void handleDirections()}
      >
        <Text className="text-base font-semibold text-white">
          Get Directions
        </Text>
      </Pressable>
    </Animated.View>
  );
}
