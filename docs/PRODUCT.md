# ChargeHub Product Specification v0.1

## Vision

ChargeHub helps EV owners find reliable charging stations faster by showing chargers across multiple networks in one simple mobile app.

## MVP Goal

Launch a working beta in one week that helps real EV users:

- Find nearby EV chargers
- Search by location
- Filter by charger type/provider
- View charger details
- Navigate to the selected charger

## Target Users

### 1. Long-distance EV driver

EV owner who travels between cities, such as Kerala to Bangalore.

Needs:
- Reliable charger discovery
- Confidence before reaching a station
- Less app switching

### 2. City EV commuter

EV owner who uses public chargers inside the city.

Needs:
- Nearby charger discovery
- Basic filters
- Quick navigation

## Core Problem

EV charging discovery is fragmented across Google Maps and multiple provider apps. Users waste time switching apps and checking whether chargers exist, work, and support their vehicle.

## MVP Features

### Must Have

- Current location detection
- Charger map
- Search by place
- Basic filters
- Charger details
- Open in Google Maps / Apple Maps

## Data Source Decision

ChargeHub v0.1 will not call OpenChargeMap directly from the mobile app.

The mobile app will read charger data from Supabase. OpenChargeMap will be used as the initial seed and periodic refresh data source for charger station data.

Reasons:

- Avoid exposing OpenChargeMap API keys in the mobile app.
- Reduce dependency on OpenChargeMap runtime availability and rate limits.
- Normalize inconsistent provider, connector, address, and power data before users see it.
- Prepare for ChargeHub-owned verification, curation, and future provider integrations.

## Charger Data Scope

ChargeHub v0.1 will show charger discovery data from a normalized Supabase mirror.

Supported charger fields:

- Charger name
- Provider/operator
- Coordinates
- Address
- Connector types
- Charging speed in kW when available
- Operating status when available
- Source attribution

ChargeHub v0.1 will treat operating status as informational only. It will not guarantee real-time charger availability.

### Later

- Login
- Favorites
- Reviews
- Community reports
- Route planner
- Wallet
- Payments
- Charging session
- Guest Charging Pass
- Provider integrations

## Non-Goals for v0.1

ChargeHub v0.1 will not:

- Start charging sessions
- Collect payments
- Store wallet balance
- Replace provider apps
- Guarantee real-time charger availability
- Support user accounts

## Success Criteria

The MVP is successful if beta users can:

- Open the app
- See nearby chargers
- Search/filter chargers
- Understand charger details
- Navigate to a charger
- Give feedback after testing
