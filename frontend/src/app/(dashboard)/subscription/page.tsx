"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SubscriptionPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/premium-expert");
  }, [router]);

  return (
    <div className="min-h-screen bg-[#050b14] flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
