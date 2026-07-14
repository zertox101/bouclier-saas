import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { hash } from 'bcryptjs';

// PATCH /api/users/[id] — update role or suspend
export async function PATCH(
    req: Request,
    { params }: { params: { id: string } }
) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { role, suspended } = await req.json();
        const updateData: any = {};
        if (role) updateData.role = role;
        if (typeof suspended === 'boolean') {
            updateData.role = suspended ? 'SUSPENDED' : 'USER';
        }

        const user = await prisma.user.update({
            where: { id: params.id },
            data: updateData,
            select: { id: true, name: true, email: true, role: true }
        });
        return NextResponse.json({ user });
    } catch (error) {
        console.error('[Users API] PATCH error:', error);
        return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
    }
}

// DELETE /api/users/[id] — remove user
export async function DELETE(
    req: Request,
    { params }: { params: { id: string } }
) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        await prisma.user.delete({ where: { id: params.id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[Users API] DELETE error:', error);
        return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
    }
}
