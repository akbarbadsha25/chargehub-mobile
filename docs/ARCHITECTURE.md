# ChargeHub Architecture v0.1

## Overview

ChargeHub is a cross-platform mobile application built with React Native and Expo. The app helps EV owners discover charging stations across multiple providers and navigate to them.

The first version focuses only on charger discovery.

---

# Tech Stack

## Mobile

- React Native
- Expo
- TypeScript

## UI

- NativeWind
- Lucide React Native

## Navigation

- React Navigation

## State Management

- Zustand

## Server State

- TanStack Query

## Backend

- Supabase

## Maps

- react-native-maps

## External Data Source

- OpenChargeMap for initial seed and periodic refresh

The mobile app must not call OpenChargeMap directly in v0.1.

---

# Folder Structure

```
src/

app/

components/
    atoms/
    molecules/
    organisms/

screens/

navigation/

services/

hooks/

store/

types/

utils/

constants/

assets/
```

---

# Data Flow

```
User

↓

Current Location

↓

Supabase

↓

TanStack Query Cache

↓

Map Screen

↓

Marker

↓

Charger Details

↓

Google Maps Navigation
```

---

# Data Source Strategy

ChargeHub v0.1 uses Supabase as the normalized mirror/cache for charger station data.

OpenChargeMap is the upstream source for initial charger data and future refresh jobs. OpenChargeMap data is imported into Supabase, normalized, and served to the mobile app from Supabase.

The mobile app reads charger data only from Supabase.

Reasons:

- Avoid exposing OpenChargeMap API keys in the mobile app.
- Avoid direct mobile dependency on OpenChargeMap rate limits and availability.
- Normalize incomplete or inconsistent charger records before rendering.
- Support ChargeHub-specific verification and future provider integrations.
- Keep the mobile API surface stable if upstream data sources change.

---

# State Responsibilities

## Zustand

Store only UI state.

Examples:

- Selected filters
- Selected charger
- Map settings
- Theme
- App preferences

---

## TanStack Query

Store server data.

Examples:

- Chargers
- Search results
- Supabase query responses

---

# Database

## charging_stations

- id
- name
- operator_id
- data_source_id
- address_line_1
- address_line_2
- town
- state_or_province
- postcode
- country
- latitude
- longitude
- status
- verified
- source_station_id
- last_source_update_at
- created_at
- updated_at

---

## station_connectors

- id
- station_id
- connector_type
- current_type
- power_kw
- amps
- voltage
- quantity
- status
- created_at
- updated_at

---

## operators

- id
- name
- website_url
- phone
- email
- source_operator_id
- created_at
- updated_at

---

## data_sources

- id
- name
- source_type
- attribution
- license
- base_url
- last_imported_at
- created_at
- updated_at

---

## user_reports (Future)

- station_id
- report_type
- created_at

---

# API Layer

services/

supabase.ts

chargers.ts

maps.ts

location.ts

OpenChargeMap import/refresh logic must stay outside the mobile app runtime.

Never call APIs directly from screens.

---

# Navigation

Stack Navigation

Splash

↓

Permission

↓

Home

↓

Search

↓

Filters

↓

Charger Details

↓

Settings

---

# Development Principles

- Small reusable components
- Strong typing
- No duplicated code
- No inline styles
- Keep screens simple
- Services handle APIs
- Components never know API details

---

# Future Architecture

Version 2

- Authentication
- Favorites
- Route Planner
- Guest Charging Pass
- Payments
- Provider APIs
