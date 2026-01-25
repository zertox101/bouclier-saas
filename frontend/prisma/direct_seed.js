
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const genId = () => Math.random().toString(36).substring(2, 15);

async function run() {
    const dbPath = path.join(__dirname, '..', 'dev.db');
    const db = new Database(dbPath);

    console.log('--- 🛡️ Starting Direct Database Seeding ---');

    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash('Bouclier2026!', salt);

    const orgs = [
        { name: 'Sovereign Admin Unit', slug: 'admin-unit', plan: 'SUPER_ADMIN' },
        { name: 'Standard Shield Fleet', slug: 'standard-fleet', plan: 'PLAN_1' },
        { name: 'Advanced Defense Group', slug: 'advanced-defense', plan: 'PLAN_2' },
        { name: 'Ultimate VIP Sentinel', slug: 'vip-sentinel', plan: 'VIP' },
    ];

    const users = [
        {
            email: 'admin@bouclier.ma',
            name: 'Grand Commandant',
            role: 'SUPER_ADMIN',
            orgSlug: 'admin-unit'
        },
        {
            email: 'user1@bouclier.ma',
            name: 'Tactical Analyst (Plan 1)',
            role: 'USER',
            orgSlug: 'standard-fleet'
        },
        {
            email: 'user2@bouclier.ma',
            name: 'Senior Sentinel (Plan 2)',
            role: 'USER',
            orgSlug: 'advanced-defense'
        },
        {
            email: 'vip@bouclier.ma',
            name: 'VIP Sovereign Guard',
            role: 'USER',
            orgSlug: 'vip-sentinel'
        }
    ];

    try {
        const insertOrg = db.prepare(`
            INSERT INTO Organization (id, name, slug, plan, subscriptionStatus, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(slug) DO UPDATE SET plan=excluded.plan
        `);

        const insertUser = db.prepare(`
            INSERT INTO User (id, name, email, password, role, orgId, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(email) DO UPDATE SET role=excluded.role, orgId=excluded.orgId
        `);

        const getOrgBySlug = db.prepare(`SELECT id FROM Organization WHERE slug = ?`);

        const now = new Date().toISOString();

        for (const org of orgs) {
            const existing = getOrgBySlug.get(org.slug);
            const id = existing ? existing.id : genId();
            insertOrg.run(id, org.name, org.slug, org.plan, 'ACTIVE', now, now);
            console.log(`[+] Organization Synced: ${org.name}`);
        }

        for (const u of users) {
            const org = getOrgBySlug.get(u.orgSlug);
            if (!org) {
                console.error(`[-] Organization not found for slug: ${u.orgSlug}`);
                continue;
            }
            const existingUser = db.prepare(`SELECT id FROM User WHERE email = ?`).get(u.email);
            const id = existingUser ? existingUser.id : genId();

            insertUser.run(id, u.name, u.email, hashedPass, u.role, org.id, now, now);
            console.log(`[+] User Synced: ${u.email} (${u.role})`);
        }

        console.log('--- ✅ Seeding Complete ---');
    } catch (err) {
        console.error('[-] Error seeding database:', err);
    } finally {
        db.close();
    }
}

run();
