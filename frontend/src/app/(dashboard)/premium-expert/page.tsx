"use client";

import dynamic from "next/dynamic";

const PremiumExpertDashboard = dynamic(
  () => import("@/components/dashboard/PremiumExpertDashboard"),
  { ssr: false }
);

export default function PremiumExpertPage() {
  return (
    <main className="h-full">
      <PremiumExpertDashboard />
    </main>
  );
}
