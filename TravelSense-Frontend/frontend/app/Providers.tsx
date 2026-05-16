"use client";

import { LocationProvider } from "@/hooks/useLocation";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LocationProvider>{children}</LocationProvider>
  );
}
