# ChargeHub Build Setup

## EAS Configuration

ChargeHub uses Expo EAS profiles for development, preview, and future production builds.

Before running cloud builds:

1. Install or use EAS CLI with `npx eas-cli`.
2. Sign in with `npx eas-cli login`.
3. Initialize the EAS project when ready with `npx eas-cli init`.
4. Configure the required EAS environment variables.

Do not put secret values, service-role keys, or production credentials in `eas.json`.

## Required Environment Variables

Configure these names in EAS and in local `.env` files:

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `EXPO_PUBLIC_OPENCHARGEMAP_API_KEY`

Only publishable client keys belong in the mobile app. Never add the Supabase service-role key to Expo, EAS, source files, or checked-in config.

## Android Preview Build

```sh
npx eas-cli build --platform android --profile preview
```

The preview profile uses internal distribution for beta testers.

## iOS Simulator Build

```sh
npx eas-cli build --platform ios --profile development-simulator
```

Use this profile for iOS Simulator testing with a development client.

## iOS Physical Device Requirements

Physical iPhone builds require:

- An Apple Developer account.
- A registered iOS bundle identifier: `com.akbarbadsha.chargehub`.
- Valid signing credentials managed by EAS or Apple.
- Registered test devices for internal development builds, when required.
- TestFlight or another approved distribution path for broader beta testing.

## Asset Audit

Final ChargeHub branding assets are not present yet. The app currently relies on Expo defaults because no icon, adaptive icon, or splash image files are configured.

Before public beta branding is finalized, add and configure:

- App icon: `src/assets/icon.png`, 1024 x 1024 px PNG.
- Android adaptive icon foreground: `src/assets/adaptive-icon.png`, 1024 x 1024 px transparent PNG with safe-area padding.
- Splash image: `src/assets/splash.png`, at least 1242 x 2436 px PNG, centered artwork with a solid background color.
- Optional favicon for web: `src/assets/favicon.png`, 48 x 48 px PNG.

After adding final assets, wire them in `app.json` under `expo.icon`, `expo.android.adaptiveIcon`, `expo.splash`, and `expo.web.favicon`.
