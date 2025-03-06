export default {
  expo: {
    name: 'healofull',
    slug: 'healofull',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/main-logos/icon.png',
    userInterfaceStyle: 'light',
    splash: {
      image: './assets/main-logos/icon.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff'
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: true
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/main-logos/icon.png',
        backgroundColor: '#ffffff'
      }
    },
    web: {
      favicon: './assets/favicon.png'
    },
    extra: {
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
    },
    plugins: [
      'expo-router'
    ]
  }
};
