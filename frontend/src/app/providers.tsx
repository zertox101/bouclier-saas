"use client";

import { SessionProvider } from "next-auth/react";
import { NotificationProvider, ToastContainer } from "@/components/NotificationSystem";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <NotificationProvider>
                {children}
                <ToastContainer />
            </NotificationProvider>
        </SessionProvider>
    );
}
