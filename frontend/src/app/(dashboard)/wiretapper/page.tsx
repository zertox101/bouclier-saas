"use client";
import React from 'react';
import dynamic from 'next/dynamic';

const WireTapperPro = dynamic(
  () => import('@/components/dashboard/WireTapperPro'),
  { ssr: false }
);

export default function WireTapperPage() {
  return (
    <main className="h-full bg-[#05070a]">
      <WireTapperPro />
    </main>
  );
}
