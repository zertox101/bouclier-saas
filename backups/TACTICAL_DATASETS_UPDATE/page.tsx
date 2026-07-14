"use client";

import dynamic from "next/dynamic";

const Datasets = dynamic(
  () => import("@/components/dashboard/Datasets"),
  { ssr: false }
);

export default function DatasetsPage() {
  return (
    <main className="h-full">
      <Datasets />
    </main>
  );
}
