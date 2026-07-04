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

## External API

- OpenChargeMap

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

OpenChargeMap API

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
- API responses

---

# Database

## charging_stations

- id
- name
- provider
- address
- latitude
- longitude
- connector_type
- power_kw
- verified

---

## user_reports (Future)

- station_id
- report_type
- created_at

---

# API Layer

services/

openChargeMap.ts

maps.ts

location.ts

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