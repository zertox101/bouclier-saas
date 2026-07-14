import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

const ROLE_ROUTES: Record<string, string[]> = {
    "/admin": ["SUPER_ADMIN"],
    "/org": ["ORG_ADMIN", "SUPER_ADMIN"],
    "/soc": ["ANALYST", "ORG_ADMIN", "SUPER_ADMIN"],
};

export default withAuth(
    function middleware(req) {
        if (process.env.NEXTAUTH_BYPASS === "true") {
            return NextResponse.next();
        }

        const { pathname } = req.nextUrl;
        const token = req.nextauth.token;

        const routePrefix = Object.keys(ROLE_ROUTES).find((prefix) =>
            pathname === prefix || pathname.startsWith(prefix + "/")
        );

        if (routePrefix) {
            const allowedRoles = ROLE_ROUTES[routePrefix];
            const userRole = token?.role as string | undefined;

            if (!userRole || !allowedRoles.includes(userRole)) {
                const url = new URL("/login", req.url);
                url.searchParams.set("callbackUrl", pathname);
                url.searchParams.set("error", "Access denied. Insufficient permissions.");
                return NextResponse.redirect(url);
            }
        }

        return NextResponse.next();
    },
    {
        pages: {
            signIn: "/login",
        },
        callbacks: {
            authorized: ({ token, req }) => {
                if (process.env.NEXTAUTH_BYPASS === "true") return true;
                return !!token;
            },
        },
    }
);

export const config = {
    matcher: [
        "/admin/:path*",
        "/org/:path*",
        "/soc/:path*",
        "/dashboard/:path*",
        "/traffic/:path*",
        "/tools/:path*",
        "/terminal-kali/:path*",
        "/scans/:path*",
        "/threat-map-pro/:path*",
        "/assets/:path*",
        "/logs/:path*",
        "/reports/:path*",
        "/settings/:path*",
        "/overview/:path*",
        "/alerts/:path*",
        "/attack-path/:path*",
        "/shadow-root/:path*",
        "/red-team/:path*",
        "/purple-team/:path*",
        "/users/:path*",
        "/ai-agent/:path*",
        "/arsenal/:path*",
        "/world-monitor/:path*",
        "/mission-command/:path*",
        "/ai-pentester/:path*",
        "/red-hound/:path*",
        "/infrastructure/:path*",
        "/wiretapper/:path*",
        "/malware-lab/:path*",
        "/graph/:path*",
        "/osint/:path*",
        "/sentinel/:path*",
        "/mini-agent/:path*",
        "/ai-reasoning/:path*",
        "/saas-control/:path*",
        "/operation-soc-expert/:path*",
        "/premium-expert/:path*",
        "/datasets/:path*",
        "/threat-monitor/:path*",
        "/globe/:path*",
        "/incidents/:path*",
        "/cases/:path*",
        "/playbooks/:path*",
        "/mitre/:path*",
        "/grc/:path*",
        "/executive/:path*",
        "/analytics/:path*",
        "/profile/:path*",
        "/raptor/:path*",
        "/offensive-consultant/:path*",
        "/neural-pentest/:path*",
        "/mythos-intelligence/:path*",
        "/wstg-scanner/:path*",
        "/detection-engineering/:path*",
        "/cloud-security/:path*",
        "/k8s-security/:path*",
        "/ad-lab/:path*",
        "/iot-security/:path*",
        "/smart-city/:path*",
    ],
};
