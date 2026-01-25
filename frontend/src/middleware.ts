import { withAuth } from "next-auth/middleware";

export default withAuth({
    pages: {
        signIn: "/login",
    },
});

export const config = {
    matcher: [
        "/dashboard/:path*",
        "/traffic/:path*",
        "/tools/:path*",
        "/scans/:path*",
        "/threat-map-pro/:path*",
        "/assets/:path*",
        "/logs/:path*",
        "/reports/:path*",
        "/settings/:path*",
        "/overview/:path*",
        "/alerts/:path*",
    ],
};
