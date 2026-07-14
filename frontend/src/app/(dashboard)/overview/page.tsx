"use client";

import dynamic from "next/dynamic";

const ExecutiveClientDashboard = dynamic(
    () => import("@/components/dashboard/ExecutiveClientDashboard"),
    { ssr: false }
);

export default function DashboardOverviewPage() {
    return (
        <main className="h-full">
            <ExecutiveClientDashboard />
        </main>
    );
}
