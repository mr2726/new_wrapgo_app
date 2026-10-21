const appJson = require('./app.json');

module.exports = ({config}) => ({
  ...appJson.expo,
  ...config,
  android: {
    ...appJson.expo.android,
    ...config.android,
    ...(process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY
      ? {
          config: {
            ...appJson.expo.android?.config,
            ...config.android?.config,
            googleMaps: {
              apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
            },
          },
        }
      : {}),
  },
});
