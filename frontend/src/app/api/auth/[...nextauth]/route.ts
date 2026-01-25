import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import { compare } from 'bcryptjs';

export const runtime = 'nodejs';

export const authOptions: NextAuthOptions = {
    // @ts-ignore
    adapter: PrismaAdapter(prisma),
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error('Invalid credentials');
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email },
                    include: { organization: true }
                });

                if (!user || !user.password) {
                    throw new Error('User not found');
                }

                const isValid = await compare(credentials.password, user.password);

                if (!isValid) {
                    throw new Error('Invalid password');
                }

                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    image: user.image,
                    role: user.role,
                    orgId: user.orgId,
                    orgName: user.organization?.name,
                    orgPlan: user.organization?.plan
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
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                // @ts-ignore
                session.user.role = token.role;
                // @ts-ignore
                session.user.id = token.sub;
                // @ts-ignore
                session.user.orgId = token.orgId;
                // @ts-ignore
                session.user.orgName = token.orgName;
                // @ts-ignore
                session.user.orgPlan = token.orgPlan;
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
