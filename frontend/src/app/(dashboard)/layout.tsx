import { DashboardLayoutClient } from "@/components/dashboard/dashboard-layout-client";
import { AuthGuard } from "@/components/auth/auth-guard";
import { DemoBanner } from "@/components/demo-banner";
import { cookies } from "next/headers";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = cookies();
  const isDemo = cookieStore.get("demo_session")?.value === "true";

  return (
    <AuthGuard>
      <>
        {isDemo && <DemoBanner />}
        <DashboardLayoutClient>{children}</DashboardLayoutClient>
      </>
    </AuthGuard>
  );
} 