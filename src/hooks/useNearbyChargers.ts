import { useQuery } from '@tanstack/react-query';

import { getNearbyChargers } from '@/services/chargers';
import { Coordinates } from '@/services/location';

export function useNearbyChargers(center: Coordinates | null) {
  return useQuery({
    enabled: center !== null,
    placeholderData: (previousData) => previousData,
    queryFn: () => {
      if (!center) {
        return Promise.resolve([]);
      }

      return getNearbyChargers(center);
    },
    queryKey: ['nearby-chargers', center?.latitude, center?.longitude],
    retry: 1
  });
}
