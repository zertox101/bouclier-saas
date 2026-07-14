import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// GET /api/stats — real platform statistics
export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Real database counts
        const [totalUsers, activeOrgs, totalOrgs] = await Promise.all([
            prisma.user.count(),
            prisma.organization.count({ where: { subscriptionStatus: 'ACTIVE' } }),
            prisma.organization.count(),
        ]);

        // Real session count (active sessions in DB)
        const now = new Date();
        const activeSessions = await prisma.session.count({
            where: { expires: { gt: now } }
        });

        // Real users by role
        const usersByRole = await prisma.user.groupBy({
            by: ['role'],
            _count: { role: true }
        });

        // Recent registrations (last 7 days)
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const recentUsers = await prisma.user.count({
            where: { createdAt: { gte: sevenDaysAgo } }
        });

        // Users registered per day (last 7 days) for sparkline
        const userHistory = await prisma.user.findMany({
            where: { createdAt: { gte: sevenDaysAgo } },
            select: { createdAt: true }
        });

        const dailyCounts: Record<string, number> = {};
        for (let i = 6; i >= 0; i--) {
            const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
            dailyCounts[d.toISOString().slice(0, 10)] = 0;
        }
        userHistory.forEach(u => {
            const day = u.createdAt.toISOString().slice(0, 10);
            if (dailyCounts[day] !== undefined) dailyCounts[day]++;
        });

        return NextResponse.json({
            totalUsers,
            activeSessions,
            totalOrgs,
            activeOrgs,
            recentUsers,
            usersByRole: usersByRole.map(r => ({ role: r.role, count: r._count.role })),
            userTrend: Object.entries(dailyCounts).map(([date, count]) => ({ date, count })),
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('[Stats API] error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
