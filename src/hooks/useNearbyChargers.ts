import { useQuery } from '@tanstack/react-query';

import { getNearbyChargers } from '@/services/chargers';
import { CurrentLocation } from '@/services/location';

export function useNearbyChargers(location: CurrentLocation | null) {
  return useQuery({
    enabled: location !== null,
    queryFn: () => {
      if (!location) {
        return Promise.resolve([]);
      }

      return getNearbyChargers(location);
    },
    queryKey: ['nearby-chargers', location?.latitude, location?.longitude],
    retry: 1
  });
}
