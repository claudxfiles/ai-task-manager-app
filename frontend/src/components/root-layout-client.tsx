"use client";

import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/components/auth-provider";
import { DemoAuthProvider } from "@/components/auth/demo-auth-provider";
import { DemoModeBanner } from "@/components/demo-mode-banner";
import { Toaster } from "sonner";

export function RootLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <AuthProvider>
        <DemoAuthProvider>
          {children}
          <DemoModeBanner />
          <Toaster />
        </DemoAuthProvider>
      </AuthProvider>
    </ThemeProvider>
  );
} 