import { Charger } from '@/services/chargers';

export type ChargerFilter = 'ccs2' | 'type2' | 'chademo' | 'power50';

export const chargerFilterOptions: readonly {
  id: ChargerFilter;
  label: string;
}[] = [
  { id: 'ccs2', label: 'CCS2' },
  { id: 'type2', label: 'Type 2' },
  { id: 'chademo', label: 'CHAdeMO' },
  { id: 'power50', label: '50kW+' }
];

function matchesConnector(
  connectorTypes: string[],
  filter: ChargerFilter
): boolean {
  return connectorTypes.some((connectorType) => {
    const normalized = connectorType.toLowerCase();
    const compact = normalized.replace(/[^a-z0-9]/g, '');

    if (filter === 'ccs2') {
      return compact.includes('ccs') && compact.includes('type2');
    }

    if (filter === 'type2') {
      return compact.includes('type2') && !compact.includes('ccs');
    }

    return filter === 'chademo' && compact.includes('chademo');
  });
}

function matchesFilter(charger: Charger, filter: ChargerFilter): boolean {
  if (filter === 'power50') {
    return charger.maxPowerKw !== null && charger.maxPowerKw >= 50;
  }

  return matchesConnector(charger.connectorTypes, filter);
}

export function filterChargers(
  chargers: Charger[],
  filters: readonly ChargerFilter[]
): Charger[] {
  if (filters.length === 0) {
    return chargers;
  }

  return chargers.filter((charger) =>
    filters.some((filter) => matchesFilter(charger, filter))
  );
}
