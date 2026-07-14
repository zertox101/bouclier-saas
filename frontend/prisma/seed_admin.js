const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const password = await bcrypt.hash('admin123', 12);
    
    // Create Default Org
    const org = await prisma.organization.upsert({
        where: { slug: 'default' },
        update: {},
        create: {
            name: 'Bouclier Default',
            slug: 'default',
            plan: 'ENTERPRISE'
        }
    });

    // Create Admin User
    const user = await prisma.user.upsert({
        where: { email: 'admin@local' },
        update: {
            password: password,
            role: 'ADMIN'
        },
        create: {
            email: 'admin@local',
            name: 'Administrator',
            password: password,
            role: 'ADMIN',
            orgId: org.id
        }
    });

    console.log('Frontend Admin user seeded:', user.email);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
