"use client";

import dynamic from "next/dynamic";

const SOCCommandDashboard = dynamic(
  () => import("@/components/dashboard/SOCCommandDashboard"),
  { ssr: false }
);

export default function OperationSOCExpertPage() {
  return (
    <main className="h-full">
      <SOCCommandDashboard />
    </main>
  );
}
