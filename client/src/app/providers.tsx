'use client';

import UpdateOverlay from '@/components/UpdateOverlay';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <UpdateOverlay />
      {children}
    </>
  );
}
