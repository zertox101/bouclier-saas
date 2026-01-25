
const { PrismaClient } = require('@prisma/client')
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3')
const Database = require('better-sqlite3')
const bcrypt = require('bcryptjs')
const path = require('path')

async function seed() {
    const dbPath = path.join(process.cwd(), 'dev.db')
    const db = new Database(dbPath)
    const adapter = new PrismaBetterSqlite3(db)
    const prisma = new PrismaClient({ adapter })

    console.log('--- 🛡️ Starting Tactical User Seeding ---')

    const salt = await bcrypt.genSalt(10)
    const hashedPass = await bcrypt.hash('Bouclier2026!', salt)

    // 1. Create Organizations for different plans
    const orgs = [
        { name: 'Sovereign Admin Unit', slug: 'admin-unit', plan: 'SUPER_ADMIN' },
        { name: 'Standard Shield Fleet', slug: 'standard-fleet', plan: 'PLAN_1' },
        { name: 'Advanced Defense Group', slug: 'advanced-defense', plan: 'PLAN_2' },
        { name: 'Ultimate VIP Sentinel', slug: 'vip-sentinel', plan: 'VIP' },
    ]

    for (const orgData of orgs) {
        await prisma.organization.upsert({
            where: { slug: orgData.slug },
            update: { plan: orgData.plan },
            create: orgData
        })
    }

    const adminOrg = await prisma.organization.findUnique({ where: { slug: 'admin-unit' } })
    const p1Org = await prisma.organization.findUnique({ where: { slug: 'standard-fleet' } })
    const p2Org = await prisma.organization.findUnique({ where: { slug: 'advanced-defense' } })
    const vipOrg = await prisma.organization.findUnique({ where: { slug: 'vip-sentinel' } })

    // 2. Create Users
    const users = [
        {
            email: 'admin@bouclier.ma',
            name: 'Grand Commandant',
            role: 'SUPER_ADMIN',
            orgId: adminOrg.id
        },
        {
            email: 'user1@bouclier.ma',
            name: 'Tactical Analyst (Plan 1)',
            role: 'USER',
            orgId: p1Org.id
        },
        {
            email: 'user2@bouclier.ma',
            name: 'Senior Sentinel (Plan 2)',
            role: 'USER',
            orgId: p2Org.id
        },
        {
            email: 'vip@bouclier.ma',
            name: 'VIP Sovereign Guard',
            role: 'USER',
            orgId: vipOrg.id
        }
    ]

    for (const u of users) {
        await prisma.user.upsert({
            where: { email: u.email },
            update: {
                role: u.role,
                orgId: u.orgId,
                password: hashedPass
            },
            create: {
                email: u.email,
                name: u.name,
                role: u.role,
                password: hashedPass,
                orgId: u.orgId
            }
        })
        console.log(`[+] User Synced: ${u.email} (${u.role})`)
    }

    console.log('--- ✅ Seeding Complete: Credentials are set to "Bouclier2026!" ---')
    await prisma.$disconnect()
}

seed().catch(e => {
    console.error(e)
    process.exit(1)
})
