import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mohammadalarem.yemenai',
  appName: 'Yemen AI',
  webDir: 'dist',
  server: {
    cleartext: true
  }
};

export default config;