import { useCallback, useEffect, useMemo, useState } from 'react';

import { Charger } from '@/services/chargers';
import {
  getFavoriteChargers,
  removeFavoriteCharger,
  saveFavoriteCharger,
  subscribeFavorites
} from '@/services/favorites';

export function useFavorites() {
  const [favorites, setFavorites] = useState<Charger[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadFavorites = useCallback(async () => {
    setIsLoading(true);

    try {
      setFavorites(await getFavoriteChargers());
      setErrorMessage(null);
    } catch {
      setErrorMessage('Unable to load favorite chargers.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadFavorites();

    return subscribeFavorites((nextFavorites) => {
      setFavorites(nextFavorites);
      setErrorMessage(null);
    });
  }, [loadFavorites]);

  const favoriteIds = useMemo(
    () => new Set(favorites.map((favorite) => favorite.id)),
    [favorites]
  );

  const isFavorite = useCallback(
    (chargerId: string) => favoriteIds.has(chargerId),
    [favoriteIds]
  );

  const toggleFavorite = useCallback(
    async (charger: Charger) => {
      try {
        setErrorMessage(null);

        if (favoriteIds.has(charger.id)) {
          await removeFavoriteCharger(charger.id);
          return;
        }

        await saveFavoriteCharger(charger);
      } catch {
        setErrorMessage('Unable to update favorite charger.');
      }
    },
    [favoriteIds]
  );

  return {
    errorMessage,
    favorites,
    isFavorite,
    isLoading,
    reload: loadFavorites,
    toggleFavorite
  };
}
