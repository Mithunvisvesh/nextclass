import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MobileScheduleProvider } from './src/context/MobileScheduleContext';
import { MobileApp } from './src/mobile/MobileApp';

export default function App() {
  return (
    <SafeAreaProvider>
      <MobileScheduleProvider>
        <MobileApp />
      </MobileScheduleProvider>
    </SafeAreaProvider>
  );
}
