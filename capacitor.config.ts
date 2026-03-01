import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.whbs.cartonpackingsys',
  appName: 'cartonpackingsys',
  webDir: 'www',
  plugins: {
    Keyboard: {
      resize: 'ionic',
      resizeOnFullScreen: true
    },
  }
};

export default config;
