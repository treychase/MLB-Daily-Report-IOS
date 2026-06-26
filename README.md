# MLB Daily Report — iOS App

React Native (Expo) iOS app that mirrors all features of the MLB Daily Report Shiny dashboard.

## Features

| Tab | Description |
|-----|-------------|
| **Today** | Live game scores, line scores, box scores, top 5 daily hitters & starters |
| **Monthly** | Month-to-date Statcast hitters, starters, and relievers |
| **Leaderboard** | Season hitters/pitchers with team, position, and PA/IP filters |
| **Projections** | Interactive multi-team Bayesian win projection chart with standings |
| **Betting** | Gamma–Poisson / Normal-IG posterior predictive props with park & platoon adjustments |

## Data

All data is pre-computed daily at 8 AM ET by the GitHub Actions workflow and uploaded to Hugging Face as JSON. The app reads from:

```
https://huggingface.co/datasets/treychase/mlb-daily-report/resolve/main/data/{name}.json
```

**No backend required.** The daily refresh script (`scripts/refresh_data.R`) now exports JSON alongside RDS files.

## Setup

```bash
npm install
npx expo start
```

Then press `i` to open in iOS Simulator, or scan the QR code with the Expo Go app on your iPhone.

## TestFlight

To build and submit to TestFlight:

```bash
npx eas build --platform ios
npx eas submit --platform ios
```

You'll need an Apple Developer account and EAS CLI configured (`npm install -g eas-cli && eas login`).

## Stack

- **Expo SDK 51** (React Native 0.74)
- **React Navigation** — bottom tab navigator
- **TanStack Query** — data fetching with 1-hour stale time
- **react-native-svg** — custom win projection line chart
- `@expo/vector-icons` — Ionicons tab icons
