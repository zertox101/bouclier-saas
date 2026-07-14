"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { NotificationProvider, ToastContainer } from "@/components/shared/NotificationSystem";
import { ViewModeProvider } from "@/lib/viewMode";
import { AutomationSafetyProvider } from "@/lib/automationSafety";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
                <ViewModeProvider>
                    <AutomationSafetyProvider>
                        <NotificationProvider>
                            {children}
                            <ToastContainer />
                        </NotificationProvider>
                    </AutomationSafetyProvider>
                </ViewModeProvider>
            </ThemeProvider>
        </SessionProvider>
    );
}
