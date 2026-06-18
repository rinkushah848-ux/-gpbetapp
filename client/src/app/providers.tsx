'use client';

import UpdateOverlay from '@/components/UpdateOverlay';
import PushNotificationSetup from '@/components/PushNotificationSetup';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <UpdateOverlay />
      <PushNotificationSetup />
      {children}
    </>
  );
}
