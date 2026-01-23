import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  server: {
      androidScheme: "http",
      cleartext: true
  },
  appId: 'com.pasakumu.karte.app',
  appName: 'qualification-project',
  webDir: 'out'
};

export default config;
