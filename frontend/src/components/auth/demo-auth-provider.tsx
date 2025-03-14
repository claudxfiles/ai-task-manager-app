"use client";

import { createContext, useContext, ReactNode } from "react";
import { useDemoAuth } from "@/hooks/useDemoAuth";

interface DemoAuthContextType {
  isDemoSession: boolean;
  isLoading: boolean;
  loginDemo: () => Promise<boolean>;
  logoutDemo: () => void;
}

const DemoAuthContext = createContext<DemoAuthContextType | undefined>(undefined);

export function DemoAuthProvider({ children }: { children: ReactNode }) {
  const demoAuth = useDemoAuth();

  return (
    <DemoAuthContext.Provider value={demoAuth}>
      {children}
    </DemoAuthContext.Provider>
  );
}

export function useDemoAuthContext() {
  const context = useContext(DemoAuthContext);
  if (context === undefined) {
    throw new Error("useDemoAuthContext must be used within a DemoAuthProvider");
  }
  return context;
} 