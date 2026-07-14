"use client";
import React from 'react';
import TargetInfrastructureStatus from '@/components/dashboard/TargetInfrastructureStatus';

export default function InfrastructurePage() {
  return (
    <div className="min-h-screen bg-[#050b14] p-6 lg:p-8">
      <TargetInfrastructureStatus />
    </div>
  );
}
