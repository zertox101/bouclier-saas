import NextAuth, { DefaultSession } from "next-auth"
import { JWT } from "next-auth/jwt"

declare module "next-auth" {
    interface Session {
        user: {
            id: string
            role: "SUPER_ADMIN" | "ORG_ADMIN" | "ANALYST"
            orgId?: string | null
            orgName?: string
            orgPlan?: string
            permissions?: string[]
            accessToken?: string
        } & DefaultSession["user"]
    }

    interface User {
        id: string
        role: "SUPER_ADMIN" | "ORG_ADMIN" | "ANALYST"
        orgId?: string | null
        orgName?: string
        orgPlan?: string
        permissions?: string[]
        accessToken?: string
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        role?: "SUPER_ADMIN" | "ORG_ADMIN" | "ANALYST"
        orgId?: string | null
        orgName?: string
        orgPlan?: string
        permissions?: string[]
        accessToken?: string
    }
}
