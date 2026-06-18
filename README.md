# PGSS Guardian — React Native Expo App

Personal Guardian Safety System — real-time fall detection, vital monitoring & emergency alerts.

## Stack
- **Expo SDK 53** with `expo-router` (file-based routing)
- **Supabase** for real-time data sync (alerts table, vitals table, commands channel)
- **expo-location** for GPS coordinates
- **@react-native-async-storage/async-storage** for persisting user profile
- TypeScript throughout

## Project Structure

```
PGSSGuardian/
├── app/
│   ├── _layout.tsx              # Root layout + AppProvider
│   ├── index.tsx                # Boot: redirects to onboarding or dashboard
│   ├── onboarding/
│   │   ├── _layout.tsx          # Onboarding stack
│   │   ├── index.tsx            # Step 1: Personal info
│   │   ├── guardian.tsx         # Step 2: Emergency contact
│   │   └── health.tsx           # Step 3: Health records + finish
│   └── (tabs)/
│       ├── _layout.tsx          # Bottom tab navigator
│       ├── dashboard.tsx        # Monitor tab (BPM, vitals, GPS, guardian)
│       ├── connect.tsx          # Connect tab (ESP32 WiFi connection)
│       ├── history.tsx          # Activity log with filter chips
│       └── account.tsx          # Profile view + edit modal
├── context/
│   └── AppContext.tsx           # Global state: user, device, vitals, alerts
├── lib/
│   └── supabase.ts              # Supabase client + sbLogAlert, sbUpdateVitals, sbListenCommands
├── constants/
│   └── theme.ts                 # Color tokens + Supabase credentials
├── app.json
├── package.json
└── tsconfig.json
```

## Supabase Tables Required

### `alerts`
| column     | type    |
|------------|---------|
| id         | int8 PK |
| type       | text    |
| severity   | int4    |
| gps        | text    |
| user_name  | text    |
| guardian   | text    |
| device_ip  | text    |
| created_at | timestamptz |

### `vitals`
| column     | type    |
|------------|---------|
| id         | int8 PK |
| bpm        | int4    |
| battery    | int4    |
| fall_score | int4    |
| gps_lat    | text    |
| gps_lng    | text    |
| device_ip  | text    |
| updated_at | timestamptz |

### `commands`
| column     | type    |
|------------|---------|
| id         | int8 PK |
| action     | text    | — 'sleep' or 'panic'
| created_at | timestamptz |

Enable Realtime for the `commands` table so remote triggers work.

## Setup & Run

```bash
npm install
npx expo start
```

Scan the QR with the **Expo Go** app (iOS/Android), or press `i` for iOS simulator / `a` for Android emulator.

## Building for Production

```bash
# Install EAS CLI
npm install -g eas-cli

# Configure
eas build:configure

# Build
eas build --platform android   # or ios
```

## Credentials
Supabase URL and anon key are in `constants/theme.ts`. Move them to a `.env` file + `expo-constants` for production.
