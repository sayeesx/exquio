import { Redirect } from 'expo-router';
import { useEffect } from 'react';
import { secureLog } from '../utils/secureLogging';

export default function Index() {
  useEffect(() => {
    secureLog('App Initialization', {
      startTime: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      version: process.env.EXPO_PUBLIC_APP_VERSION || '1.0.0'
    });
  }, []);

  return <Redirect href="/home" />;
}