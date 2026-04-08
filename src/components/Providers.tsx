"use client";

import { ReactLenis } from '@studio-freight/react-lenis';
import { ReactNode } from 'react';
import { AppProvider } from '@/context/AppContext';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AppProvider>
      <ReactLenis root options={{ lerp: 0.1, duration: 1.5 }}>
        <>{children}</>
      </ReactLenis>
    </AppProvider>
  );
}
