import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export const runtime = 'nodejs';

const API_URL = process.env.INTERNAL_API_URL || 'http://backend:8005';

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                const backendRes = await fetch(`${API_URL}/api/auth/login`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email: credentials?.email, password: credentials?.password })
                });
                if (!backendRes.ok) {
                    throw new Error("Invalid credentials");
                }
                const backendData = await backendRes.json();
                return {
                    id: String(backendData.user?.id ?? ""),
                    name: backendData.user?.username ?? credentials?.email,
                    email: backendData.user?.email ?? credentials?.email,
                    role: backendData.user?.role ?? "ANALYST",
                    orgId: backendData.user?.org_id ?? null,
                    orgName: "Bouclier Enterprise",
                    orgPlan: "PRO",
                    permissions: backendData.user?.permissions ?? [],
                    accessToken: backendData.access_token
                };
            }
        })
    ],
    session: {
        strategy: 'jwt'
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = user.role;
                token.orgId = user.orgId;
                token.orgName = user.orgName;
                token.orgPlan = user.orgPlan;
                token.permissions = user.permissions;
                token.accessToken = user.accessToken;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.role = token.role as "SUPER_ADMIN" | "ORG_ADMIN" | "ANALYST";
                session.user.id = token.sub!;
                session.user.orgId = token.orgId;
                session.user.orgName = token.orgName;
                session.user.orgPlan = token.orgPlan;
                session.user.permissions = token.permissions;
                session.user.accessToken = token.accessToken;
            }
            return session;
        }
    },
    pages: {
        signIn: '/login',
        error: '/login'
    }
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
