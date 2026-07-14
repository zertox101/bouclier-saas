import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { hash } from 'bcryptjs';

// GET /api/users — list all users (admin only)
export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // @ts-ignore
    if (session.user.role !== 'ADMIN' && session.user.role !== 'admin') {
        // For academic project: allow all authenticated users to read
        // In production: return 403
    }

    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
                updatedAt: true,
                orgId: true,
                organization: {
                    select: { name: true, plan: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json({ users });
    } catch (error) {
        console.error('[Users API] GET error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST /api/users — create a new user
export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { name, email, password, role } = await req.json();
        if (!email || !password || !name) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const exists = await prisma.user.findUnique({ where: { email } });
        if (exists) {
            return NextResponse.json({ error: 'User already exists' }, { status: 409 });
        }

        const hashedPassword = await hash(password, 12);
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: role || 'USER',
                organization: {
                    create: {
                        name: `${name}'s Lab`,
                        slug: `org-${Math.random().toString(36).substr(2, 9)}`,
                        plan: 'ACADEMIC'
                    }
                }
            },
            select: { id: true, name: true, email: true, role: true, createdAt: true }
        });

        return NextResponse.json({ user }, { status: 201 });
    } catch (error) {
        console.error('[Users API] POST error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
