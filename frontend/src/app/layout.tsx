import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import "./globals.css";
import { metadata } from "./metadata";
import { RootLayoutClient } from "@/components/root-layout-client";
import { ToastProvider } from "@/components/providers/toast-provider";
import { AuthProvider } from "@/components/auth-provider";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🧠</text></svg>" />
      </head>
      <body className={cn(
        "min-h-screen bg-background font-sans antialiased",
        inter.className
      )}>
        <AuthProvider>
          <ToastProvider>
            <RootLayoutClient>
              {children}
            </RootLayoutClient>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

export { metadata };
