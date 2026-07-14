import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const { email, password, name } = await req.json();

        if (!email || !password) {
            return NextResponse.json(
                { message: 'Missing required fields' },
                { status: 400 }
            );
        }

        const exists = await prisma.user.findUnique({
            where: { email }
        });

        if (exists) {
            return NextResponse.json(
                { message: 'User already exists' },
                { status: 409 }
            );
        }

        const hashedPassword = await hash(password, 12);

        const user = await prisma.user.create({
            data: {
                email,
                name,
                password: hashedPassword,
                role: 'ANALYST',
                organization: {
                    create: {
                        name: `${name}'s Organization`,
                        slug: `org-${Math.random().toString(36).substr(2, 9)}`,
                        plan: "FREE"
                    }
                }
            }
        });

        return NextResponse.json({
            message: 'User created successfully',
            user: {
                id: user.id,
                email: user.email,
                name: user.name
            }
        });

    } catch (error) {
        console.error('Registration Error:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}
