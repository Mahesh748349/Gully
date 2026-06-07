const appJson = require("./app.json");

// Load .env during local development when dotenv is available
try {
  require("dotenv").config();
} catch (e) {}

const googleMapsApiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || "";

module.exports = {
  ...appJson.expo,
  plugins: [
    ...(appJson.expo.plugins || []),
    [
      "expo-location",
      {
        locationWhenInUsePermission: "Gully uses your location to show nearby games and pin your match ground.",
      },
    ],
  ],
  ios: {
    ...appJson.expo.ios,
    config: {
      ...appJson.expo.ios?.config,
      googleMapsApiKey,
    },
    infoPlist: {
      ...appJson.expo.ios?.infoPlist,
      NSLocationWhenInUseUsageDescription: "Gully uses your location to show nearby live games on the map.",
    },
  },
  android: {
    ...appJson.expo.android,
    config: {
      ...appJson.expo.android?.config,
      googleMaps: {
        apiKey: googleMapsApiKey,
      },
    },
    permissions: [
      ...new Set([...(appJson.expo.android?.permissions || []), "ACCESS_COARSE_LOCATION", "ACCESS_FINE_LOCATION"]),
    ],
  },
  extra: {
    ...(appJson.expo.extra || {}),
    googleMapsApiKey,
  },
};
