const { getDefaultConfig } = require('expo/metro-config');
const { prepareWeb, watchWeb } = require('./scripts/prepare-web.cjs');

// Also runs for `npx expo start` and `npx expo export`, without npm hooks.
prepareWeb();
if (!process.env.CI) watchWeb();

module.exports = getDefaultConfig(__dirname);
