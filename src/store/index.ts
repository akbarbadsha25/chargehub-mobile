import { create } from 'zustand';

import { ChargerFilter } from '@/utils/filterChargers';

import type {
  CurrentLocation,
  LocationPermissionStatus
} from '@/services/location';

type DiagnosticsState = {
  activeFilters: ChargerFilter[];
  chargerCount: number | null;
  lastKnownLocation: CurrentLocation | null;
  permissionStatus: LocationPermissionStatus;
  setHomeDiagnostics: (diagnostics: {
    activeFilters: ChargerFilter[];
    chargerCount: number | null;
    lastKnownLocation: CurrentLocation | null;
    permissionStatus: LocationPermissionStatus;
  }) => void;
};

export const useChargeHubDiagnosticsStore = create<DiagnosticsState>((set) => ({
  activeFilters: [],
  chargerCount: null,
  lastKnownLocation: null,
  permissionStatus: 'unknown',
  setHomeDiagnostics: (diagnostics) => set(diagnostics)
}));
