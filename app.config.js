const { withAndroidManifest } = require('expo/config-plugins');

module.exports = ({ config }) => {
  if (process.env.E2E_BUILD !== '1') return config;
  // A separate package prevents overwriting the developer's regular app.
  return withAndroidManifest({
    ...config,
    android: { ...config.android, package: 'com.logecommerce.mobile.e2e' },
  }, (mod) => {
    mod.modResults.manifest.application[0].$['android:usesCleartextTraffic'] = 'true';
    return mod;
  });
};
